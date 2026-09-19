import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Search,
  RefreshCw,
  Layers,
  FileCheck2,
  X,
  ExternalLink,
  Loader2,
  Radio,
  ChevronLeft,
  ChevronRight,
  Calendar
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
  const getLocalYMD = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [filterDate, setFilterDate] = useState(getLocalYMD()); // Default to today
  const [baseDate, setBaseDate] = useState(getLocalYMD());

  const formatDateLabel = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Parse the date strictly from the string to avoid timezone shifting
    const [y, m, d] = dateStr.split("-");
    const target = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) return "Today";
    if (target.getTime() === yesterday.getTime()) return "Yesterday";
    return target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const visibleDates = [];
  for (let i = -2; i <= 2; i++) {
    const [y, m, d] = baseDate.split("-");
    const temp = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    temp.setDate(temp.getDate() + i);
    visibleDates.push(getLocalYMD(temp));
  }

  const shiftBaseDate = (days) => {
    const [y, m, d] = baseDate.split("-");
    const temp = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    temp.setDate(temp.getDate() + days);
    setBaseDate(getLocalYMD(temp));

    if (filterDate) {
      const [fy, fm, fd] = filterDate.split("-");
      const fTemp = new Date(parseInt(fy), parseInt(fm) - 1, parseInt(fd));
      fTemp.setDate(fTemp.getDate() + days);
      setFilterDate(getLocalYMD(fTemp));
    }
  };

  const handleDatePick = (e) => {
    const picked = e.target.value;
    if (picked) {
      setBaseDate(picked);
      setFilterDate(picked);
    }
  };

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

  const filtered = logs.filter((l) => {
    // Wallet address filter
    if (searchAddr.trim() && !l.user.toLowerCase().includes(searchAddr.trim().toLowerCase())) {
      return false;
    }
    // Date filter
    if (filterDate) {
      const logDate = new Date(l.timestamp * 1000);
      const [fy, fm, fd] = filterDate.split("-");
      const filterStart = new Date(parseInt(fy), parseInt(fm) - 1, parseInt(fd), 0, 0, 0, 0);
      const filterEnd = new Date(parseInt(fy), parseInt(fm) - 1, parseInt(fd), 23, 59, 59, 999);
      if (logDate < filterStart || logDate > filterEnd) return false;
    }
    return true;
  });

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

      {/* Date Filter Bar */}
      <div className="date-filter-bar">
        <button className="date-nav-btn" onClick={() => shiftBaseDate(-1)} title="Previous Day">
          <ChevronLeft className="icon-sm" />
        </button>

        <div className="date-buttons-group">
          <AnimatePresence mode="popLayout">
            {visibleDates.map((dateStr) => (
              <motion.button
                layout
                initial={{ opacity: 0, scale: 0.8, x: filterDate && dateStr > filterDate ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                key={dateStr}
                className={`date-label-btn ${filterDate === dateStr ? "date-label-btn--active" : ""}`}
                onClick={() => {
                  setFilterDate(filterDate === dateStr ? null : dateStr);
                  setBaseDate(dateStr);
                }}
              >
                <span>{formatDateLabel(dateStr)}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <button
          className="date-nav-btn"
          onClick={() => shiftBaseDate(1)}
          title="Next Day"
        >
          <ChevronRight className="icon-sm" />
        </button>

        <div className="date-picker-wrapper">
          <input 
            type="date" 
            className="date-picker-input" 
            value={filterDate || ""} 
            onChange={handleDatePick} 
            title="Pick a specific date"
          />
        </div>
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
