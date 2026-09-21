import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div className="not-found-icon-box">
        <AlertCircle className="not-found-icon text-red" style={{ width: 64, height: 64 }} />
      </div>
      <h1 className="not-found-title" style={{ fontSize: "3rem", marginTop: 24 }}>
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: 4 }}>
        Page Not Found
      </h2>
      <p className="not-found-text" style={{ maxWidth: 420, marginTop: 12 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn-primary btn-inline" style={{ marginTop: 24 }}>
        <Home className="icon-sm" /> Return to Home
      </Link>
    </main>
  );
}