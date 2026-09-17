# AegisCare DApp — Revision & System Guide

## Project Overview
A decentralized application (DApp) that acts as an immutable audit log for AI-generated medical pre-triage assessments. By storing cryptographic prompt and response records on the blockchain, users can publicly verify AI outputs without central server tampering.

> **Note:** This document is a personal reference log. Preserves lessons from the BOT Chain proof-of-concept phase and documents the migration to the production React/Vite stack.

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

### 🔄 Production Stack (AegisCare — In Progress)
* **Frontend Framework:** React.js (Vite SPA)
* **Routing:** `react-router-dom` — dual portal (`/` User, `/admin` Admin)
* **Styling:** Tailwind CSS (Pastel theme — `slate-50`, `blue-300`, `purple-300`)
* **AI Model:** Google Gemini API (`gemini-2.5-flash`)
* **Web3:** `ethers.js` v5 via npm
* **Network:** Same — Datagram / BOT Chain Testnet (Chain ID: `968`)
* **Contract Address:** `0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f`
* **Secrets:** Managed via `.env` (git-ignored)

---

## End-to-End Execution Flow (Production)

```
[ User Portal / ]                    [ Admin Portal /admin ]
       │                                       │
       ▼                                       ▼
[ Symptom Input ]               [ Read getAdviceCount() ]
       │                                       │
       ▼                                       ▼
[ Gemini API Query ]            [ Iterate adviceLogs(i) ]
  gemini-2.5-flash                             │
       │                                       ▼
       ▼                          [ Render Audit Log Cards ]
[ AI Assessment Preview ]        [ Filter by Wallet Address ]
       │
       ▼
[ MetaMask Signs logAdvice() ]
  { gasLimit: 3000000 }
       │
       ▼
[ BOT Chain / AIAdvisor.sol ]
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

### Phase 4: React/Vite Migration (AegisCare) 🔄 In Progress
- [ ] Scaffold Vite React project
- [ ] Configure `react-router-dom` for `/` and `/admin` routes
- [ ] Build User Portal with Gemini API integration + `logAdvice()` transaction
- [ ] Build Admin Portal with full ledger reader and address filter
- [ ] Apply pastel Tailwind theme

---

## Key Technical Learnings

* **Blockchains as Verifiable Registries:** Smart contracts serve as immutable audit layers rather than heavy database replacements.
* **State Mutation vs. Reading:**
  * Reading state (`view` functions) is instant, free, and uses a **Provider**.
  * Writing state requires a **Signer**, user signature approval, and a transaction fee in native gas tokens (`DGRAM`).
* **Client-Side Debugging & Pitfalls:**
  * **Hex String Format:** Address variables must be wrapped as explicit string literals (`"0x..."`) to prevent JavaScript from parsing them as numbers (`1.38e+48`).
  * **Explicit Gas Overrides:** Custom testnets may fail automatic gas estimations; always use `{ gasLimit: 3000000 }` to prevent node execution rejections.
  * **API Key Security:** Never commit `.env` to version control — always add to `.gitignore` before first push.