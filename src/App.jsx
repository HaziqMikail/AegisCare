import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useWeb3 } from "./hooks/useWeb3";
import Header from "./components/Header";
import UserPortal from "./pages/UserPortal";
import AdminPortal from "./pages/AdminPortal";
import "./index.css";

export default function App() {
  const { account, contract, connecting, error, connectWallet, disconnect } = useWeb3();

  return (
    <BrowserRouter>
      <div className="app-root">
        <Header
          account={account}
          connecting={connecting}
          onConnect={connectWallet}
          onDisconnect={disconnect}
        />

        {error && (
          <div className="global-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <Routes>
          <Route path="/" element={<UserPortal account={account} contract={contract} />} />
          <Route path="/admin" element={<AdminPortal account={account} contract={contract} />} />
        </Routes>

        <footer className="footer">
          <p>AegisCare · Powered by Gemini AI × BOT Chain Testnet · Chain ID: 968</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
