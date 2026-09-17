import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOT_CHAIN } from "../constants";

const RPC_URL = BOT_CHAIN.rpcUrls[0];
const CHAIN_CONFIG = { chainId: 968, name: "Datagram" };

export function useWeb3() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize RPC provider and contract by default
  const initPublicContract = useCallback(() => {
    try {
      const publicProvider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_CONFIG);
      const publicContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, publicProvider);
      setContract(publicContract);
      return publicContract;
    } catch (err) {
      console.error("Public contract init error:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    initPublicContract();
  }, [initPublicContract]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      // Switch or add BOT Chain
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
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = web3Provider.getSigner();
      const userContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setAccount(accounts[0]);
      setContract(userContract);
    } catch (err) {
      setError(err.message || "Wallet connection failed.");
      initPublicContract();
    } finally {
      setConnecting(false);
    }
  }, [initPublicContract]);

  const disconnect = useCallback(() => {
    setAccount(null);
    initPublicContract();
  }, [initPublicContract]);

  return { account, contract, connecting, error, connectWallet, disconnect };
}
