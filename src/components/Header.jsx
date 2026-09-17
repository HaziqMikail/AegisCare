import { NavLink } from "react-router-dom";

export default function Header({ account, connecting, onConnect, onDisconnect }) {
  const truncate = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          <span className="logo-icon">⚕</span>
          <span className="logo-text">Aegis<span className="logo-accent">Care</span></span>
        </div>

        {/* Portal Navigation */}
        <nav className="portal-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-pill ${isActive ? "nav-pill--active" : ""}`}
          >
            <span className="nav-pill-icon">👤</span>
            User Portal
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-pill ${isActive ? "nav-pill--admin-active" : ""}`}
          >
            <span className="nav-pill-icon">🛡</span>
            Admin Portal
          </NavLink>
        </nav>

        {/* Wallet Badge */}
        <div className="wallet-area">
          {account ? (
            <div className="wallet-connected">
              <span className="wallet-dot" />
              <span className="wallet-address">{truncate(account)}</span>
              <button className="btn-disconnect" onClick={onDisconnect} title="Disconnect">✕</button>
            </div>
          ) : (
            <button
              className="btn-connect"
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? (
                <><span className="spinner" /> Connecting…</>
              ) : (
                <><span className="wallet-icon">🦊</span> Connect Wallet</>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
