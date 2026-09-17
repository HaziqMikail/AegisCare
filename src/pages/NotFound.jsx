import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="portal-container">
      <div className="card text-center not-found-card">
        <div className="not-found-icon-box">
          <AlertCircle className="not-found-icon text-red" />
        </div>
        <h1 className="not-found-title">404 - Page Not Found</h1>
        <p className="not-found-text">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary btn-inline">
          <Home className="icon-sm" /> Return to Home
        </Link>
      </div>
    </main>
  );
}
