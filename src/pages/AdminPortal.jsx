import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  ShieldCheck,
  Database,
  Search,
  RefreshCw,
  AlertCircle,
  Activity,
  Layers,
  FileCheck2,
  X,
  ExternalLink,
  Lock,
  Loader2
} from "lucide-react";
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
      {/* Hero Header */}
      <div className="portal-hero admin-hero">
        <div className="hero-glow-accent hero-glow-purple" />
        <div className="portal-badge-pill portal-badge-purple">
          <Lock className="icon-xs text-purple" />
          <span>Restricted Compliance & Audit Console</span>
        </div>
        <h1 className="portal-title">Immutable Healthcare Audit Ledger</h1>
        <p className="portal-subtitle">
          Supervisory inspection portal querying live smart contract logs directly from the BOT Chain EVM network (Chain ID: 968). Provides immutable auditability for AI pre-triage advice.
        </p>
      </div>

      {/* Wallet Gate */}
      {!account && (
        <div className="info-banner">
          <AlertCircle className="icon-md text-sky" />
          <div className="banner-text">
            <strong>Admin Authentication Required</strong>
            <p>Connect your MetaMask supervisor wallet to query and filter live blockchain audit logs.</p>
          </div>
        </div>
      )}

      {/* Metrics Dashboard Strip */}
      {account && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box bg-blue-soft">
              <FileCheck2 className="metric-svg text-blue" />
            </div>
            <div className="metric-content">
              <div className="metric-value">{logs.length}</div>
              <div className="metric-label">Audited AI Logs</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box bg-purple-soft">
              <Layers className="metric-svg text-purple" />
            </div>
            <div className="metric-content">
              <div className="metric-value">{chainId ?? "968"}</div>
              <div className="metric-label">Active Chain ID</div>
            </div>
          </div>

          <div className="metric-card metric-card--addr">
            <div className="metric-icon-box bg-green-soft">
              <Database className="metric-svg text-green" />
            </div>
            <div className="metric-content">
              <div className="metric-label">Target Smart Contract</div>
              <a
                className="metric-contract-link"
                href={`https://explorer.datagram.network/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                title={CONTRACT_ADDRESS}
              >
                {CONTRACT_ADDRESS.slice(0, 8)}…{CONTRACT_ADDRESS.slice(-6)}{" "}
                <ExternalLink className="icon-xs inline" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Address Filter */}
      {account && (
        <div className="admin-controls">
          <div className="search-wrapper">
            <Search className="search-icon text-muted" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by patient wallet address (e.g. 0x3AfD...)"
              value={searchAddr}
              onChange={(e) => setSearchAddr(e.target.value)}
            />
            {searchAddr && (
              <button className="search-clear" onClick={() => setSearchAddr("")}>
                <X className="icon-xs" />
              </button>
            )}
          </div>

          <button
            className={`btn-refetch ${loading ? "btn-loading" : ""}`}
            onClick={fetchLogs}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner-icon" /> Querying Chain…
              </>
            ) : (
              <>
                <RefreshCw className="icon-xs" /> Refresh Ledger
              </>
            )}
          </button>
        </div>
      )}

      {/* Audit Log Feed */}
      {account && (
        <div className="log-feed">
          {loading && !fetched && (
            <div className="loading-state">
              <Loader2 className="loading-spinner-lg text-purple" />
              <p>Reading state storage arrays from `AIAdvisor.sol`…</p>
            </div>
          )}

          {fetched && filtered.length === 0 && (
            <div className="empty-state">
              <Activity className="empty-icon text-muted" />
              <p>{searchAddr ? "No on-chain records match this wallet address filter." : "No AI triage records logged on-chain yet."}</p>
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
