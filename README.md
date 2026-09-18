# AegisCare — Verifiable AI Health Pre-Triage DApp

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75FF?style=flat-square&logo=googlecloud&logoColor=white)](https://ai.google.dev/)
[![Network](https://img.shields.io/badge/Chain_ID-968_(BOT_Chain)-00C49F?style=flat-square)](https://scan.bohr.life)

**AegisCare** is an immutable audit registry for AI-generated medical pre-triage assessments. It addresses critical challenges in digital healthcare—including AI liability, hallucination, and data opacity—by cryptographically recording every patient symptom prompt and AI assessment directly onto the **Datagram / BOT Chain Testnet** smart contract.


---

## 📍 Portal Navigation & Route Links

When running locally (`npm run dev`), access the two application portals via the following routes:

| Portal | Route Path | Local URL | Purpose |
|---|---|---|---|
| 🩺 **Patient User Portal** | `/` | [http://localhost:5173/](http://localhost:5173/) | Patient symptom input, Gemini 3.6 AI pre-triage assessment, and on-chain notarization |
| 🛡️ **Admin Audit Ledger** | `/admin` | [http://localhost:5173/admin](http://localhost:5173/admin) | Global compliance metrics dashboard, public ledger inspection, live auto-sync, & wallet filtering |

---

## 🌟 Key Features

* **Patient User Portal (`/`):**
  * Interactive symptom entry with quick-select clinical presets (e.g., tension headache, chest pressure, seasonal allergies, mild fever).
  * Real-time medical pre-triage evaluation using **Google Gemini 3.6 Flash** API with structured safety guardrails.
  * Instant on-chain notarization (via MetaMask or background Auto-Signer wallet).
  * Structured output rendering: Risk Level badges, Recommended Next Action, Clinical Guidance, and Medical Disclaimer.

* **Admin Audit Ledger (`/admin`):**
  * Real-time metrics dashboard tracking total audited logs, network chain status (`968`), and contract explorer link.
  * Public RPC provider fallback (`https://rpc.bohr.life`) enabling seamless audit inspection without requiring a wallet connection.
  * Reverse-chronological audit ledger feed with configurable auto-sync live polling (12s interval).
  * Client-side search & filtering by patient wallet address.

* **Immutable On-Chain Verifiability:**
  * Every assessment is stored permanently on-chain in `AIAdvisor.sol`.
  * Guarantees AI responses cannot be retroactively altered, hidden, or denied by providers or health operators.

---

## 🏗️ Architecture & Data Flow

```
[ User Portal ( / ) ]                           [ Admin Portal ( /admin ) ]
        │                                                    │
        ▼                                                    ▼
[ Symptom Input ]                            [ Public RPC Provider (https://rpc.bohr.life) ]
        │                                                    │
        ▼                                                    ▼
[ Gemini 3.6 Flash API ]                            [ Read getAdviceCount() ]
        │                                                    │
        ▼                                                    ▼
[ Formatted Pre-Triage ]                            [ Reverse Iterate adviceLogs(i) ]
        │                                                    │
        ▼                                                    ▼
[ On-Chain Notarization ] ────────────────────────► [ Render Audit Log Feed ]
(MetaMask / Auto-Signer Wallet)                     [ Filter by Patient Wallet ]
        │
        ▼
[ Datagram / BOT Chain Testnet ]
(AIAdvisor.sol @ 0xf2ecb66B...)
```

---

## 🛠️ Technical Stack

* **Frontend Framework:** React 19 + Vite 8
* **Routing:** `react-router-dom` (v7) — Dual portal system (`/` User Portal, `/admin` Admin Audit Ledger, custom `404`)
* **Styling:** Custom Soft Pastel Design System (Slate background, pastel blue/purple accents, responsive grid, Lucide icons)
* **AI Engine:** Google Gemini REST API (`gemini-3.6-flash` endpoint)
* **Web3 & Smart Contract:**
  * **Network:** Datagram / BOT Chain Testnet
  * **Chain ID:** `968` (`0x3C8`)
  * **RPC URLs:** `https://rpc.bohr.life`, `https://rpc.datagram.network`
  * **Block Explorer:** `https://scan.bohr.life`
  * **Native Token:** `DGRAM` / `BOT`
  * **Contract Address:** `0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f`
  * **Web3 Provider:** `ethers.js` (v5)

---

## ⚡ Quick Start

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MetaMask Extension](https://metamask.io/) configured for BOT Chain Testnet (optional if using background auto-signer)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/HaziqMikail/Build-Week-Hackathon.git
cd Build-Week-Hackathon
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Google Gemini API Key (Required for AI pre-triage generation)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Private key of auto-signer wallet funded with DGRAM for background zero-popup signing
VITE_AUTO_SIGNER_PRIVATE_KEY=your_private_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment

| Network | Chain ID | Smart Contract Address | Block Explorer Link |
|---|---|---|---|
| **BOT Chain Testnet** | `968` (`0x3C8`) | `0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f` | [View on Testnet Explorer](https://scan.bohr.life/address/0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f) |
| **BOT Chain Mainnet** | `Mainnet` | `Pending Mainnet Deployment` | [BOT Chain Mainnet Explorer](https://scan.botchain.ai/) |

---

## 📜 Smart Contract Specification

**`AIAdvisor.sol`** deployed on BOT Chain Testnet at [`0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f`](https://scan.bohr.life/address/0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AIAdvisor {
    struct AdviceRecord {
        address user;
        string prompt;
        string response;
        uint256 timestamp;
    }

    AdviceRecord[] public adviceLogs;

    event AdviceLogged(address indexed user, string prompt, string response, uint256 timestamp);

    function logAdvice(string memory _prompt, string memory _response) public {
        adviceLogs.push(AdviceRecord(msg.sender, _prompt, _response, block.timestamp));
        emit AdviceLogged(msg.sender, _prompt, _response, block.timestamp);
    }

    function getAdviceCount() public view returns (uint256) {
        return adviceLogs.length;
    }
```

---

## 🌐 Network Configuration (MetaMask)

To connect MetaMask manually to the BOT Chain Testnet:

* **Network Name:** Datagram / BOT Chain Testnet
* **RPC URL:** `https://rpc.bohr.life`
* **Chain ID:** `968` (`0x3C8`)
* **Currency Symbol:** `DGRAM`
* **Block Explorer:** `https://scan.bohr.life`

---

## 📁 Repository Structure

```
Build-Week-Hackathon/
├── public/
├── src/
│   ├── components/
│   │   ├── AssessmentResult.jsx   # Structured AI advice renderer
│   │   ├── Header.jsx             # Dual-portal nav & wallet connector
│   │   └── LogCard.jsx            # Audit ledger card with expandable prompt/response
│   ├── hooks/
│   │   └── useWeb3.js             # Wallet connection & transaction state hook
│   ├── pages/
│   │   ├── AdminPortal.jsx        # Admin audit ledger & metrics view
│   │   ├── UserPortal.jsx         # Patient pre-triage form & on-chain notarization
│   │   └── NotFound.jsx           # 404 route view
│   ├── prompts/
│   │   └── geminiPrompt.js        # Gemini AI prompt guardrails & formatting rules
│   ├── App.jsx                    # React Router configuration
│   ├── constants.js               # Web3 RPC, ABI, contract address, & API configs
│   ├── index.css                  # Pastel Design System & Tailwind utility styles
│   └── main.jsx                   # React application entry point
├── .env.example
├── index.html
├── package.json
├── PLAN.md                        # Software Requirement Specification
├── REVISION.md                    # System architecture & revision history log
└── vite.config.js
```

---

## 📄 License

This project is licensed under the **ISC License**.


## Linkedin

Excited to share my participation in the Build Week Vol. 2 Hackathon!



It was an incredible experience stepping out of my comfort zone for my first solo hackathon, where I experimented with connecting AI outputs to blockchain verification on the BOT Chain. Building this project gave me a great hands-on introduction to smart contract deployment, Web3 integration using Ethers.js, and structuring prompt guardrails with the Gemini API.



Working directly on the testnet also taught me a lot about EVM gas dynamics, like tuning gas settings to clear RPC node transaction thresholds, and gave me a clearer picture of how cryptography creates immutable logs to make AI guidance verifiable and tamper-proof.



While I still have plenty to learn, I'm super grateful for the opportunity to sharpen my full-stack and Web3 skills along the way!



#BuildWeek #BOTChain #AI #Web3 #Solidity #Cryptography #Learning