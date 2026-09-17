import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOT_CHAIN } from "../constants";

export function useWeb3() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install it to continue.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      // Switch to or add BOT Chain
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BOT_CHAIN.chainId }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [BOT_CHAIN],
          });
        }
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const aiContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setAccount(accounts[0]);
      setContract(aiContract);
    } catch (err) {
      setError(err.message || "Wallet connection failed.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setContract(null);
  }, []);

  return { account, contract, connecting, error, connectWallet, disconnect };
}
