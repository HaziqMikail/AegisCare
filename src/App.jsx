import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useWeb3 } from "./hooks/useWeb3";
import Header from "./components/Header";
import UserPortal from "./pages/UserPortal";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";
import "./index.css";
import botchainLogo from "./assets/botchain.png";

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
          <Route path="/" element={<UserPortal account={account} contract={contract} onConnect={connectWallet} connecting={connecting} />} />
          <Route path="/admin" element={<AdminPortal account={account} contract={contract} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="footer">
          <div className="footer-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <a href="https://botchain.ai/" target="_blank" rel="noopener noreferrer">
                <img
                  src={botchainLogo}
                  alt="BOT Chain Logo"
                  style={{ height: '50px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
                />
              </a>
              Powered by <strong>BOT Chain (EVM)</strong>
            </span>
            <span>•</span>
            <span>AegisCare · Verifiable AI Pre-Triage · Chain ID: 968</span>
            <span>•</span>
            <a href="https://botchain.ai/" target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>
              botchain.ai ↗
            </a>
            <span>•</span>
            <a href="https://scan.botchain.ai/" target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>
              BOT Chain Explorer ↗
            </a>
            <span>•</span>
            <a href="https://scan.bohr.life" target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>
              Testnet Explorer ↗
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}