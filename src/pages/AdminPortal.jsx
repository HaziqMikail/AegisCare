import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  Database,
  Search,
  RefreshCw,
  Layers,
  FileCheck2,
  X,
  ExternalLink,
  Loader2,
  Radio
} from "lucide-react";
import LogCard from "../components/LogCard";
import { CONTRACT_ADDRESS, BOT_CHAIN } from "../constants";

const RPC_URL = BOT_CHAIN.rpcUrls[0];

export default function AdminPortal({ account, contract }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [searchAddr, setSearchAddr] = useState("");
  const [chainId, setChainId] = useState(968);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Use passed contract or fallback RPC provider
      let targetContract = contract;
      if (!targetContract) {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL, { chainId: 968, name: "Datagram" });
        targetContract = new ethers.Contract(CONTRACT_ADDRESS, [
          "function getAdviceCount() public view returns (uint256)",
          "function adviceLogs(uint256) public view returns (address user, string memory prompt, string memory response, uint256 timestamp)"
        ], provider);
      }

      const count = await targetContract.getAdviceCount();
      const total = count.toNumber();
      const records = [];
      for (let i = total - 1; i >= 0; i--) {
        const log = await targetContract.adviceLogs(i);
        records.push({
          user: log.user,
          prompt: log.prompt,
          response: log.response,
          timestamp: log.timestamp.toNumber(),
        });
      }
      setLogs(records);
      setFetched(true);

      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          setChainId(network.chainId);
        } catch (e) {
          setChainId(968);
        }
      }
    } catch (err) {
      console.error("Log fetch error:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [contract]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Polling auto-refresh every 12 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const filtered = searchAddr.trim()
    ? logs.filter((l) => l.user.toLowerCase().includes(searchAddr.trim().toLowerCase()))
    : logs;

  return (
    <main className="portal-container">
      {/* Title Header */}
      <div className="portal-title-wrapper admin-header-flex">
        <h1 className="portal-title">Admin Audit Ledger</h1>
        <button
          className={`live-badge-btn ${autoRefresh ? "live-badge-btn--active" : ""}`}
          onClick={() => setAutoRefresh(!autoRefresh)}
          title="Toggle Live Auto-Sync"
        >
          <Radio className={`icon-xs ${autoRefresh ? "text-green animate-pulse" : "text-muted"}`} />
          <span>{autoRefresh ? "Live Sync ON" : "Live Sync OFF"}</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-blue-soft">
            <FileCheck2 className="metric-svg text-blue" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{logs.length}</div>
            <div className="metric-label">Total Logs</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-purple-soft">
            <Layers className="metric-svg text-purple" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{chainId ?? "968"}</div>
            <div className="metric-label">Chain ID</div>
          </div>
        </div>

        <div className="metric-card metric-card--addr">
          <div className="metric-icon-box bg-green-soft">
            <Database className="metric-svg text-green" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Smart Contract</div>
            <a
              className="metric-contract-link"
              href={`https://explorer.datagram.network/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}{" "}
              <ExternalLink className="icon-xs inline" />
            </a>
          </div>
        </div>
      </div>

      {/* Search & Action Controls */}
      <div className="admin-controls">
        <div className="search-wrapper">
          <Search className="search-icon text-muted" />
          <input
            type="text"
            className="search-input"
            placeholder="Filter by patient wallet address (0x...)..."
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
          onClick={() => fetchLogs(false)}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="spinner-icon" /> Updating…
            </>
          ) : (
            <>
              <RefreshCw className="icon-xs" /> Refresh Ledger
            </>
          )}
        </button>
      </div>

      {/* Log Feed */}
      <div className="log-feed">
        {loading && !fetched && (
          <div className="loading-state">
            <Loader2 className="loading-spinner-lg text-purple" />
            <p>Reading on-chain audit records from BOT Chain…</p>
          </div>
        )}

        {fetched && filtered.length === 0 && (
          <div className="empty-state">
            <p>{searchAddr ? "No logs match this wallet filter." : "No logs recorded on-chain yet."}</p>
          </div>
        )}

        {filtered.map((log, i) => (
          <LogCard key={`${log.user}-${log.timestamp}`} log={log} index={i} />
        ))}
      </div>
    </main>
  );
}
