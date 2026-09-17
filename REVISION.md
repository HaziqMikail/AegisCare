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