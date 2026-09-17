import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import LogCard from "../components/LogCard";
import { CONTRACT_ADDRESS } from "../constants";

export default function AdminPortal({ account, contract }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [searchAddr, setSearchAddr] = useState("");
  const [chainId, setChainId] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.getAdviceCount();
      const total = count.toNumber();
      const records = [];
      for (let i = total - 1; i >= 0; i--) {
        const log = await contract.adviceLogs(i);
        records.push({
          user: log.user,
          prompt: log.prompt,
          response: log.response,
          timestamp: log.timestamp.toNumber(),
        });
      }
      setLogs(records);
      setFetched(true);

      // Get chain ID
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(network.chainId);
    } catch (err) {
      console.error("Log fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (contract && !fetched) fetchLogs();
  }, [contract, fetched, fetchLogs]);

  const filtered = searchAddr.trim()
    ? logs.filter((l) => l.user.toLowerCase().includes(searchAddr.trim().toLowerCase()))
    : logs;

  return (
    <main className="portal-container">
      {/* Hero */}
      <div className="portal-hero admin-hero">
        <div className="portal-hero-icon">🛡</div>
        <h1 className="portal-title">Admin Audit Portal</h1>
        <p className="portal-subtitle">
          Compliance oversight for all on-chain AI health assessment records. All data is sourced directly from the smart contract — immutable and verifiable.
        </p>
      </div>

      {/* Wallet gate */}
      {!account && (
        <div className="info-banner">
          <span>🦊</span>
          <span>Connect your MetaMask wallet to access the audit ledger.</span>
        </div>
      )}

      {/* Metrics Strip */}
      {account && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{logs.length}</div>
            <div className="metric-label">Total Audited Logs</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{chainId ?? "—"}</div>
            <div className="metric-label">Network Chain ID</div>
          </div>
          <div className="metric-card metric-card--addr">
            <div className="metric-value metric-value--sm">Contract</div>
            <a
              className="metric-contract-link"
              href={`https://explorer.datagram.network/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              title={CONTRACT_ADDRESS}
            >
              {CONTRACT_ADDRESS.slice(0, 10)}…{CONTRACT_ADDRESS.slice(-6)} ↗
            </a>
          </div>
        </div>
      )}

      {/* Controls */}
      {account && (
        <div className="admin-controls">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Filter by patient wallet address…"
              value={searchAddr}
              onChange={(e) => setSearchAddr(e.target.value)}
            />
            {searchAddr && (
              <button className="search-clear" onClick={() => setSearchAddr("")}>✕</button>
            )}
          </div>
          <button
            className={`btn-refetch ${loading ? "btn-loading" : ""}`}
            onClick={fetchLogs}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Fetching…</> : "⟳ Refresh Ledger"}
          </button>
        </div>
      )}

      {/* Log Feed */}
      {account && (
        <div className="log-feed">
          {loading && !fetched && (
            <div className="loading-state">
              <div className="loading-spinner-lg" />
              <p>Reading records from BOT Chain…</p>
            </div>
          )}

          {fetched && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>{searchAddr ? "No logs match that wallet address." : "No audit logs found on-chain yet."}</p>
            </div>
          )}

          {filtered.map((log, i) => (
            <LogCard key={`${log.user}-${log.timestamp}`} log={log} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
