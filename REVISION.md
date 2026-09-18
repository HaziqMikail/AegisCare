# AegisCare DApp — Revision & System Guide

## Project Overview
A decentralized application (DApp) that acts as an immutable audit log for AI-generated medical pre-triage assessments. By storing cryptographic prompt and response records on the blockchain, users can publicly verify AI outputs without central server tampering.

> **Note:** Personal reference log. Documents the progression from the initial proof-of-concept phase to the production React/Vite stack, architectural decisions, and critical EVM/Web3 debugging solutions.

---

## Technical Stack

### ✅ Proof-of-Concept (Completed — BOT Chain Test)
* **Frontend:** Plain HTML5 + CSS3 + JavaScript (`ethers.js` v5 via CDN)
* **Smart Contract:** Solidity `0.8.19` (EVM target: `paris`/`london`)
* **Development Environment:** Remix IDE
* **Network:** Datagram / BOT Chain Testnet (Chain ID: `968`)
* **Gas Token:** `DGRAM` / `BOT`
* **Wallet:** MetaMask Extension
* **Deployed Contract Address:** `0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f`

### ✅ Production Stack (AegisCare — Completed)
* **Frontend Framework:** React.js (Vite SPA)
* **Routing:** `react-router-dom` (v7) — dual portal (`/` User Portal, `/admin` Admin Audit Ledger, `*` 404 NotFound)
* **Styling:** Custom Pastel Design System (`Inter` font, mobile-first responsive breakpoints, Lucide SVG icons)
* **AI Model:** Google Gemini REST API (`gemini-3.6-flash` endpoint)
* **Prompt Architecture:** Isolated configuration module (`src/prompts/geminiPrompt.js`)
* **Web3 Library:** `ethers` (v5) via npm
* **Network:** Datagram / BOT Chain Testnet (Chain ID: `968`)
  * **Primary RPC:** `https://rpc.bohr.life`
  * **Secondary RPC:** `https://rpc.datagram.network`
  * **Block Explorer:** `https://scan.bohr.life` / `https://explorer.datagram.network`
* **Contract Address:** `0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f`
* **Secrets:** Managed via `.env` (`VITE_GEMINI_API_KEY`, `VITE_AUTO_SIGNER_PRIVATE_KEY` git-ignored)

---

## End-to-End Execution Flow (Production)

```
[ User Portal / ]                              [ Admin Portal /admin ]
       │                                                 │
       ▼                                                 ▼
[ Symptom Input ]                         [ Public Provider (https://rpc.bohr.life) ]
  (Textarea / Quick Presets)                             │
       │                                                 ▼
       ▼                                    [ Read getAdviceCount() ]
[ Gemini API Query ]                                     │
  gemini-3.6-flash                                       ▼
       │                                    [ Reverse Iterate adviceLogs(i) ]
       ▼                                                 │
[ AI Triage Result ]                                     ▼
  (Risk Level, Recommended Action,          [ Render Audit Log Cards ]
   Clinical Guidance, Disclaimer)           [ Filter by Wallet Address ]
       │                                    [ Live Auto-Sync Polling (12s) ]
       ▼
[ On-Chain Notarization ]
  Auto-Signer Wallet OR MetaMask Signer
  Overrides: { gasLimit: 3000000, gasPrice: 25 Gwei }
       │
       ▼
[ BOT Chain / AIAdvisor.sol ] ──► [ Verified On-Chain Log Badge & Explorer Hash ]
```

---

## Phase History

### Phase 1: Environment Setup & Funding ✅
1. Configured MetaMask with the custom EVM network:
   * **Network Name:** Datagram / BOT Chain Testnet
   * **Chain ID:** `968`
2. Claimed testnet native gas tokens (`10 DGRAM`/`BOT`) via the network faucet.

### Phase 2: Smart Contract Deployment ✅
1. Authored `AIAdvisor.sol` in Remix IDE using Solidity `0.8.19`.
2. Compiled with EVM target set to `paris` or `london`.
3. Set Remix environment to **Injected Provider - MetaMask**, confirmed Chain ID `968`.
4. Set execution gas limit to `3000000` and clicked **Deploy**.
5. Deployed contract address: `0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f`

### Phase 3: BOT Chain Proof-of-Concept (Plain HTML Test) ✅
1. Included `ethers.js` (v5) CDN in `index.html` — test only, not production code.
2. Initialized `ethers.providers.Web3Provider(window.ethereum)`.
3. Created a `Contract` instance with `contractAddress`, `contractABI`, and `signer`.
4. Verified `logAdvice()`, `getAdviceCount()`, and `adviceLogs(i)` all work on-chain.

### Phase 4: React/Vite Migration (AegisCare) ✅
1. **Scaffolded Vite React SPA**: Configured `package.json` scripts and `vite.config.js`.
2. **Configured Navigation & Routing**: Set up `react-router-dom` routes for `/`, `/admin`, and `*` (custom 404 page).
3. **Built User Portal (`/`)**:
   * Integrated Gemini 3.6 Flash REST API with prompt guardrails (`src/prompts/geminiPrompt.js`).
   * Designed quick test symptom presets for 1-click evaluation.
   * Built `AssessmentResult.jsx` component formatting Risk Level, Recommended Action, Clinical Guidance, and Disclaimer.
   * Added visual loading progress track animation during inference and transaction mining.
4. **Built Admin Portal (`/admin`)**:
   * Metrics dashboard (Total Audited Logs, Chain ID 968, Contract Explorer Link).
   * Public RPC fallback provider (`https://rpc.bohr.life`) enabling log inspection without requiring wallet connection.
   * Reverse-chronological audit ledger feed with live auto-sync polling toggle (12s interval).
   * Real-time client-side search filter by patient wallet address.
5. **UI/UX & Aesthetics**:
   * Designed a responsive pastel design system (`slate-50` background, pastel blue/purple accents).
   * Replaced raw emojis with crisp `lucide-react` SVG vector icons.
   * Added inline medical pulse SVG favicon to `index.html`.

---

## Key Technical Learnings & Debugging Solutions

* **Blockchains as Verifiable Registries:** Smart contracts serve as immutable audit layers rather than heavy database replacements.
* **State Mutation vs. Reading:**
  * Reading state (`view` functions) is instant, free, and uses a **Provider**.
  * Writing state requires a **Signer**, user signature approval, and a transaction fee in native gas tokens (`DGRAM`).
* **Gemini API Model Endpoint Compatibility:**
  * Endpoint must use `models/gemini-3.6-flash:generateContent` on `v1beta` API. Legacy model tags (`gemini-2.5-flash`, `gemini-1.5-flash`) return HTTP 404 / NOT_FOUND for new users.
* **RPC Gas Price Minimum Threshold (`transaction underpriced` Fix):**
  * The BOT Chain / Bohr testnet RPC node enforces a strict **minimum gas price threshold of 20 Gwei** (`20000000000 wei`).
  * Default ethers gas estimation sends a lower tip (1.5 Gwei), which the RPC rejects with `error: code -32000, message: transaction underpriced: effective gas tip 1500000000, minimum needed 20000000000`.
  * **Solution:** Explicitly set transaction options `{ gasLimit: 3000000, gasPrice: ethers.utils.parseUnits("25", "gwei") }`.
* **Zero-Popup Background Signing vs. Injected MetaMask:**
  * MetaMask extension popups (`window.ethereum`) are browser security requirements whenever a user signs through an injected provider.
  * To enable 100% background automated zero-click transaction notarization, configure `VITE_AUTO_SIGNER_PRIVATE_KEY` in `.env` (64-character private key with testnet `DGRAM` balance).
* **UI Verification Badge Integrity:**
  * The `Verified On-Chain Log` badge must only render when `txHash` is mined on-chain. Preview states should display `AI Triage Preview`.
* **Client-Side Hex Formatting & Secrets Security:**
  * Address variables must be wrapped as explicit string literals (`"0x..."`) to prevent JavaScript from parsing them as float numbers (`1.38e+48`).
  * `.env` contains API keys and private keys; must always be included in `.gitignore` before committing.

---

## 🛠️ Build Week Vol. 2 Revision List

### 1. EVM & Smart Contracts

* **Solidity Basics & Contract Architecture (`AIAdvisor.sol`)**:
  * **Contract Structure**: Simple, efficient, non-upgradable storage contract designed for high-throughput audit logging.
  * **State Variables & Structs**: `struct AdviceRecord` bundles patient address (`address user`), symptom input (`string prompt`), AI triage response (`string response`), and block creation time (`uint256 timestamp`).
  * **Arrays**: `AdviceRecord[] public adviceLogs` acts as an append-only linear storage list.
  * **Events**: `event AdviceLogged(address indexed user, string prompt, string response, uint256 timestamp)` emits indexed EVM logs for efficient off-chain indexing and event filtering.
  * **Functions**: State-modifying function `logAdvice(string, string)` appends data and updates blockchain state; `view` function `getAdviceCount()` queries array length without gas costs.

* **EVM Gas Mechanics**:
  * **Gas Limit vs. Gas Price**: `gasLimit` sets the maximum computational units allowed for execution (e.g., `3,000,000`), while `gasPrice` defines the cost per gas unit in Gwei (1 Gwei = \(10^9\) wei).
  * **Underpriced Transaction Failures**: EVM nodes reject transactions with insufficient tip/fee allocations (`transaction underpriced`). Fixed in AegisCare by overriding default estimates with `{ gasLimit: 3000000, gasPrice: ethers.utils.parseUnits("25", "gwei") }`.

* **RPC Nodes & Testnets**:
  * **Testnet vs. Mainnet**: Testnets (e.g., Datagram / BOT Chain Testnet, Chain ID `968`) mirror Mainnet EVM execution using risk-free test tokens (`DGRAM`/`BOT`) from faucets.
  * **Custom RPC Thresholds**: Public RPC nodes (such as `https://rpc.bohr.life`) enforce custom fee floors (e.g., minimum 20 Gwei gas price threshold) to protect against spam attacks, requiring dApps to explicitly configure transaction parameters.

---

### 2. Web3 & Ethers.js

* **Providers vs. Signers**:
  * **Provider (`JsonRpcProvider` / `Web3Provider`)**: Read-only abstraction layer. Used for instant, zero-cost state reads (`getAdviceCount()`, `adviceLogs(i)`) directly from public RPC nodes without wallet connection.
  * **Signer (`Wallet` / MetaMask Signer)**: Write-capable abstraction. Cryptographically signs state-changing transactions (`logAdvice()`) requiring gas fee payments.

* **Wallet State & Injected Web3**:
  * **Injected Provider Detection**: Interacts with `window.ethereum` provided by browser extensions (e.g., MetaMask).
  * **Network & Account Event Handling**: Dynamically manages wallet connection status, network switches (verifying Chain ID `968` / `0x3C8`), and account change events (`accountsChanged`, `chainChanged`).

---

### 3. AI & Verifiable Output

* **Prompt Guardrails**:
  * **Deterministic Structure**: Standardized system prompt (`SYSTEM_PROMPT` in `src/prompts/geminiPrompt.js`) forcing Gemini 3.6 Flash to output strictly structured response sections (`Risk Level`, `Recommended Next Action`, `Clinical Guidance`, and `Medical Disclaimer`).
  * **Clinical Safety**: Embedded disclaimers ensure AI output is strictly pre-triage guidance, mitigating hallucination and medical compliance risks.

* **Verifiable AI Pattern**:
  * **Off-Chain Processing + On-Chain Notarization**: Computations/LLM inference happen off-chain via Gemini REST API for speed and cost efficiency.
  * **Tamper-Proof Audit Trail**: Cryptographic hashes of original symptom prompts and resulting AI assessments are immutably logged on-chain (`AIAdvisor.sol`), establishing an unalterable proof of record for clinical governance.

---

### 4. Full-Stack DApp Architecture

* **React SPA Setup**:
  * **Vite & React Router (v7)**: Fast modern SPA setup with dual routing layout:
    * `/` (Patient Portal): Symptom entry, Gemini AI triage, and on-chain transaction notarization.
    * `/admin` (Admin Audit Ledger): Compliance metrics dashboard, public audit ledger feed, and contract explorer link.
    * `*` (NotFound): Fallback 404 error page.

* **State Management & Auto-Sync**:
  * **Live Polling**: Configurable background polling interval (12s timer via `setInterval`) in `/admin` to auto-fetch new on-chain logs dynamically without reloading the browser.
  * **Real-Time Client Filters**: Instant search and filtering of audit logs by patient wallet address.