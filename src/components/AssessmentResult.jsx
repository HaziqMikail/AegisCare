import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Check,
  Activity,
  HeartPulse,
  FileText
} from "lucide-react";
import { CONTRACT_ADDRESS } from "../constants";

export default function AssessmentResult({ assessment, txHash }) {
  const [copied, setCopied] = useState(false);

  if (!assessment || typeof assessment !== "string") {
    return null;
  }

  const copyHash = () => {
    if (!txHash) return;
    try {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const parseAssessment = (text) => {
    let risk = "";
    let action = "";
    let disclaimer = "";
    let detailLines = [];

    try {
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = (lines[i] || "").trim();
        if (!line) continue;

        if (line.toLowerCase().includes("risk level:")) {
          risk = line.replace(/\*\*/g, "").replace(/Risk Level:\s*/i, "").trim();
        } else if (
          line.toLowerCase().includes("recommended next action:") ||
          line.toLowerCase().includes("recommended action:")
        ) {
          action = line
            .replace(/\*\*/g, "")
            .replace(/Recommended Next Action:\s*/i, "")
            .replace(/Recommended Action:\s*/i, "")
            .trim();
        } else if (line.toLowerCase().includes("disclaimer:")) {
          disclaimer = line.replace(/\*\*/g, "").replace(/Medical Disclaimer:\s*/i, "").trim();
        } else if (
          line.toLowerCase().includes("clinical summary") ||
          line.toLowerCase().includes("clinical guidance")
        ) {
          continue;
        } else {
          detailLines.push(line.replace(/\*\*/g, ""));
        }
      }
    } catch (err) {
      console.error("Assessment parsing error:", err);
    }

    return {
      risk,
      action,
      details: detailLines.join("\n\n") || text,
      disclaimer,
      raw: text,
    };
  };

  const parsed = parseAssessment(assessment);

  const getRiskStyle = (riskStr) => {
    const r = (riskStr || "").toLowerCase();
    if (r.includes("emergency") || r.includes("high")) {
      return { label: "EMERGENCY", badgeClass: "risk-pill--emergency" };
    }
    if (r.includes("moderate")) {
      return { label: "MODERATE RISK", badgeClass: "risk-pill--moderate" };
    }
    return { label: "LOW RISK", badgeClass: "risk-pill--low" };
  };

  const riskStyle = getRiskStyle(parsed.risk || assessment);

  return (
    <div className="card assessment-result-card animate-fade-in">
      <div className="assessment-card-header">
        <div className="assessment-card-title">
          <HeartPulse className="card-icon text-blue" />
          <h3>AI Pre-Triage Assessment</h3>
        </div>
        <div className={`risk-pill ${riskStyle.badgeClass}`}>
          <AlertTriangle className="icon-xs" />
          <span>{parsed.risk ? parsed.risk.toUpperCase() : riskStyle.label}</span>
        </div>
      </div>

      <div className="assessment-grid">
        {/* Recommended Action */}
        {parsed.action && (
          <div className="result-section action-section">
            <div className="section-header">
              <Activity className="icon-xs text-blue" />
              <span className="section-title">Recommended Next Action</span>
            </div>
            <p className="action-text">{parsed.action}</p>
          </div>
        )}

        {/* Clinical Assessment & Guidance Details */}
        <div className="result-section details-section">
          <div className="section-header">
            <FileText className="icon-xs text-purple" />
            <span className="section-title">Clinical Assessment &amp; Guidance</span>
          </div>
          <div className="details-body">
            {(parsed.details || parsed.raw || "").split("\n\n").map((para, idx) => (
              <p key={idx} className="details-paragraph">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Medical Disclaimer */}
        {parsed.disclaimer && (
          <div className="result-section disclaimer-section">
            <div className="section-header">
              <Info className="icon-xs text-muted" />
              <span className="section-title">Medical Disclaimer</span>
            </div>
            <p className="disclaimer-text">{parsed.disclaimer}</p>
          </div>
        )}
      </div>

      {/* On-Chain Confirmation Bar */}
      {txHash ? (
        <div className="tx-confirmed-bar">
          <div className="tx-confirmed-status">
            <ShieldCheck className="icon-sm text-green" />
            <span>Verified On-Chain Log</span>
          </div>
          <div className="tx-hash-group">
            <code className="tx-hash-code">
              {typeof txHash === "string" ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : "Confirmed"}
            </code>
            <button className="btn-icon-subtle" onClick={copyHash} title="Copy Hash">
              {copied ? <Check className="icon-xs text-green" /> : <Copy className="icon-xs" />}
            </button>
            <a
              href={`https://explorer.datagram.network/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="btn-explorer-sm"
              title="View on Block Explorer"
            >
              <ExternalLink className="icon-xs" />
            </a>
          </div>
        </div>
      ) : (
        <div className="tx-pending-bar">
          <Info className="icon-xs text-muted" />
          <span>AI Triage Preview</span>
        </div>
      )}
    </div>
  );
}
