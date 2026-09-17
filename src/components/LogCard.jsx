export default function LogCard({ log, index }) {
  const truncate = (addr) => `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  const formatTime = (ts) =>
    new Date(ts * 1000).toLocaleString("en-MY", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="log-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="log-card-header">
        <div className="log-index">#{String(index + 1).padStart(3, "0")}</div>
        <div className="log-timestamp">🕐 {formatTime(log.timestamp)}</div>
      </div>

      <div className="log-field">
        <span className="log-label">Patient Wallet</span>
        <code className="log-hash">{truncate(log.user)}</code>
      </div>

      <div className="log-field">
        <span className="log-label">Symptoms Reported</span>
        <p className="log-value">{log.prompt}</p>
      </div>

      <div className="log-field">
        <span className="log-label">AI Assessment</span>
        <div className="log-assessment">
          {log.response.split("\n").map((line, i) =>
            line.trim() ? <p key={i}>{line}</p> : null
          )}
        </div>
      </div>

      <div className="log-footer">
        <span className="log-badge log-badge--onchain">✓ On-Chain Verified</span>
      </div>
    </div>
  );
}
