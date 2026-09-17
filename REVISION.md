# Proof of AI DApp - Revision & System Guide

## Project Overview
A decentralized application (DApp) that acts as an immutable audit log for AI recommendations. By storing cryptographic prompt and response records on the blockchain, users can publicly verify AI outputs without central server tampering.

---

## Technical Stack
* **Smart Contract:** Solidity `0.8.19` (EVM target: `paris`/`london`)
* **Development Environment:** Remix IDE
* **Network:** Datagram / BOT Chain Testnet (Chain ID: `968`)
* **Gas Token:** `DGRAM` / `BOT`
* **Wallet:** MetaMask Extension
* **Frontend:** HTML5, CSS3, JavaScript (Ethers.js v5)
* **Deployed Contract Address:** `0x3AfD2a35656733ea7369f30ad5989cab4b2d9bd9`

---

## End-to-End Execution Flow

```
[ Frontend UI ] ---> [ MetaMask Wallet ] ---> [ Datagram/BOT Chain ] ---> [ AIAdvisor.sol ]
 (HTML/CSS/JS)       (Transaction Signer)     (EVM Testnet ID: 968)      (Smart Contract)
```

1. **Prompt Entry:** User submits a prompt and receives AI output in the frontend interface.
2. **Wallet Authentication:** User connects MetaMask (`eth_requestAccounts`) to sign the state transaction using their public address (`0x...`).
3. **Transaction Broadcast:** `ethers.js` passes the payload (`prompt`, `response`) to `aiContract.logAdvice()` with an explicit `{ gasLimit: 3000000 }`.
4. **On-Chain Persistence:** The Datagram/BOT Chain network processes the transaction, appending the caller address, prompt, response, and timestamp to the `adviceLogs` state array.
5. **Log Retrieval:** The frontend calls `getAdviceCount()` and iterates through `adviceLogs(i)` to render verified records directly from the blockchain.

---

## Step-by-Step Implementation Steps

### Phase 1: Environment Setup & Funding
1. Configured MetaMask with the custom EVM network:
   * **Network Name:** Datagram / BOT Chain Testnet
   * **Chain ID:** `968`
2. Claimed testnet native gas tokens (`10 DGRAM`/`BOT`) via the network faucet.

### Phase 2: Smart Contract Deployment
1. Authored `AIAdvisor.sol` in Remix IDE using Solidity `0.8.19`.
2. Compiled the contract with the EVM compiler target set to `paris` or `london`.
3. Set Remix environment to **Injected Provider - MetaMask** and confirmed network connection on Chain ID `968`.
4. Set execution gas limit to `3000000` and clicked **Deploy**.
5. Approved the gas fee in MetaMask and copied the resulting deployed contract address.

### Phase 3: Frontend & Web3 Integration
1. Included `ethers.js` (v5) CDN in `index.html`.
2. Initialized `ethers.providers.Web3Provider(window.ethereum)` to interface with the injected browser wallet.
3. Created a `Contract` instance passing the `contractAddress`, `contractABI`, and `signer`.
4. Attached event handlers for connecting the wallet, sending write transactions, and reading log arrays.

---

## Key Technical Learnings

* **Blockchains as Verifiable Registries:** Smart contracts serve as immutable audit layers rather than heavy database replacements.
* **State Mutation vs. Reading:** 
  * Reading state (`view` functions) is instant, free, and uses a **Provider**.
  * Writing state requires a **Signer**, user signature approval, and a transaction fee in native gas tokens (`DGRAM`).
* **Client Side Debugging & Pitfalls:**
  * **Hex String Format:** Address variables must be wrapped as explicit string literals (`"0x..."`) to prevent JavaScript from parsing them as numbers (`1.38e+48`).
  * **Explicit Gas Overrides:** Custom testnets may fail automatic client-side gas estimations; explicitly providing `{ gasLimit: 3000000 }` prevents node execution rejections.