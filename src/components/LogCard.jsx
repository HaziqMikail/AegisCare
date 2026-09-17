import { useState } from "react";
import { User, Clock, FileText, Bot, ShieldCheck, Copy, Check, ExternalLink, AlertTriangle } from "lucide-react";
import { CONTRACT_ADDRESS } from "../constants";

export default function LogCard({ log, index }) {
  const [copied, setCopied] = useState(false);

  const truncate = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatTime = (ts) =>
    new Date(ts * 1000).toLocaleString("en-MY", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const copyWallet = () => {
    navigator.clipboard.writeText(log.user);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadge = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("emergency") || lower.includes("high risk")) {
      return { label: "EMERGENCY", class: "risk-pill--emergency" };
    }
    if (lower.includes("moderate")) {
      return { label: "MODERATE", class: "risk-pill--moderate" };
    }
    if (lower.includes("low")) {
      return { label: "LOW RISK", class: "risk-pill--low" };
    }
    return null;
  };

  const riskBadge = getRiskBadge(log.response);

  return (
    <div className="log-card" style={{ animationDelay: `${index * 40}ms` }}>
      <div className="log-card-top">
        <div className="log-card-meta">
          <span className="log-id">#{String(index + 1).padStart(3, "0")}</span>
          <div className="log-wallet-badge">
            <User className="icon-xs text-muted" />
            <code className="log-wallet-addr">{truncate(log.user)}</code>
            <button className="btn-icon-subtle" onClick={copyWallet} title="Copy Address">
              {copied ? <Check className="icon-xs text-green" /> : <Copy className="icon-xs" />}
            </button>
          </div>
        </div>

        <div className="log-right-meta">
          {riskBadge && (
            <span className={`risk-pill ${riskBadge.class}`}>
              <AlertTriangle className="icon-xs" /> {riskBadge.label}
            </span>
          )}
          <span className="log-time">
            <Clock className="icon-xs text-muted" /> {formatTime(log.timestamp)}
          </span>
        </div>
      </div>

      <div className="log-card-body">
        <div className="log-section">
          <span className="log-section-label">
            <FileText className="icon-xs text-blue" /> Reported Symptoms
          </span>
          <p className="log-prompt-text">{log.prompt}</p>
        </div>

        <div className="log-section">
          <span className="log-section-label">
            <Bot className="icon-xs text-purple" /> AI Pre-Triage Log
          </span>
          <div className="log-response-text">
            {log.response.split("\n").map((line, i) =>
              line.trim() ? <p key={i}>{line}</p> : null
            )}
          </div>
        </div>
      </div>

      <div className="log-card-footer">
        <span className="log-verified-tag">
          <ShieldCheck className="icon-xs text-green" /> On-Chain Verified
        </span>
        <a
          href={`https://explorer.datagram.network/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="log-explorer-btn"
        >
          Explorer <ExternalLink className="icon-xs" />
        </a>
      </div>
    </div>
  );
}
