import { useState } from "react";
import { User, Clock, FileText, Bot, ShieldCheck, Copy, Check, ExternalLink, AlertTriangle, Activity } from "lucide-react";
import { CONTRACT_ADDRESS } from "../constants";

export default function LogCard({ log, index }) {
  const [copied, setCopied] = useState(false);

  const truncate = (addr) => `${addr.slice(0, 8)}...${addr.slice(-6)}`;
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

  // Extract Risk Level if present in response
  const getRiskBadge = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("emergency") || lower.includes("high risk")) {
      return { label: "EMERGENCY RISK", class: "risk-tag--emergency" };
    }
    if (lower.includes("moderate")) {
      return { label: "MODERATE RISK", class: "risk-tag--moderate" };
    }
    if (lower.includes("low")) {
      return { label: "LOW RISK", class: "risk-tag--low" };
    }
    return null;
  };

  const riskBadge = getRiskBadge(log.response);

  return (
    <div className="log-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="log-card-header">
        <div className="log-card-header-left">
          <span className="log-index">#{String(index + 1).padStart(3, "0")}</span>
          {riskBadge && (
            <span className={`risk-tag ${riskBadge.class}`}>
              <AlertTriangle className="icon-xs" /> {riskBadge.label}
            </span>
          )}
        </div>
        <div className="log-timestamp">
          <Clock className="icon-xs" /> {formatTime(log.timestamp)}
        </div>
      </div>

      <div className="log-field">
        <span className="log-label">
          <User className="icon-xs" /> Patient Wallet Address
        </span>
        <div className="log-hash-wrapper">
          <code className="log-hash">{truncate(log.user)}</code>
          <button className="btn-icon-subtle" onClick={copyWallet} title="Copy wallet address">
            {copied ? <Check className="icon-xs text-green" /> : <Copy className="icon-xs" />}
          </button>
        </div>
      </div>

      <div className="log-field">
        <span className="log-label">
          <FileText className="icon-xs" /> Reported Symptoms
        </span>
        <p className="log-value">{log.prompt}</p>
      </div>

      <div className="log-field">
        <span className="log-label">
          <Bot className="icon-xs" /> Verified AI Triage Record
        </span>
        <div className="log-assessment">
          {log.response.split("\n").map((line, i) =>
            line.trim() ? <p key={i}>{line}</p> : null
          )}
        </div>
      </div>

      <div className="log-footer">
        <span className="log-badge log-badge--onchain">
          <ShieldCheck className="icon-xs" /> On-Chain Verified Immutable Log
        </span>
        <a
          href={`https://explorer.datagram.network/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="log-explorer-link"
        >
          View Contract <ExternalLink className="icon-xs" />
        </a>
      </div>
    </div>
  );
}
