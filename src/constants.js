// Contract deployed on BOT Chain Testnet (Chain ID: 968)
export const CONTRACT_ADDRESS = "0xf2ecb66B46b1ca1a9Ff18DfF59383093E10a0b5f";

export const CONTRACT_ABI = [
  "function logAdvice(string memory _prompt, string memory _response) public",
  "function getAdviceCount() public view returns (uint256)",
  "function adviceLogs(uint256) public view returns (address user, string memory prompt, string memory response, uint256 timestamp)",
];

export const BOT_CHAIN = {
  chainId: "0x3C8", // 968 in hex
  chainName: "Datagram / BOT Chain Testnet",
  nativeCurrency: { name: "DGRAM", symbol: "DGRAM", decimals: 18 },
  rpcUrls: ["https://rpc.bohr.life", "https://rpc.datagram.network"],
  blockExplorerUrls: ["https://scan.bohr.life", "https://explorer.datagram.network"],
};

export const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
export const GEMINI_MODEL = "gemini-3.6-flash";
export const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
export const AUTO_SIGNER_PRIVATE_KEY = (import.meta.env.VITE_AUTO_SIGNER_PRIVATE_KEY || "").trim();
