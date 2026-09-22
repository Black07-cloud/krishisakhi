import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--content-bg)",
      padding: "24px",
      textAlign: "center",
      gap: "16px",
    }}
  >
    <div style={{ fontSize: "72px", fontWeight: "800", color: "#e2e8f0", lineHeight: 1 }}>404</div>
    <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>Page not found</h2>
    <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "340px" }}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/dashboard"
      id="not-found-home-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 20px",
        background: "#16a34a",
        color: "#fff",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        textDecoration: "none",
        marginTop: "8px",
      }}
    >
      <Home size={16} />
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
