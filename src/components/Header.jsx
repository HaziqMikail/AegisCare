import { Activity, Wallet, X, Loader2, ShieldCheck, Database } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header({ account, connecting, onConnect, onDisconnect }) {
  const truncate = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon-wrapper">
            <Activity className="logo-icon-svg" />
          </div>
          <span className="logo-text">
            Aegis<span className="logo-accent">Care</span>
          </span>
          <span className="badge badge-v2">V1.0</span>
        </Link>

        {/* Wallet Connection */}
        <div className="wallet-area">
          {account ? (
            <div className="wallet-connected">
              <span className="wallet-dot" />
              <Wallet className="wallet-icon-svg" />
              <span className="wallet-address">{truncate(account)}</span>
              <button className="btn-disconnect" onClick={onDisconnect} title="Disconnect Wallet">
                <X className="icon-xs" />
              </button>
            </div>
          ) : (
            <button
              className="btn-connect"
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="spinner-icon" /> Connecting…
                </>
              ) : (
                <>
                  <Wallet className="wallet-icon-svg" /> Connect Wallet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
