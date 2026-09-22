import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--content-bg)",
          fontSize: "14px",
          color: "var(--text-muted)",
          gap: "10px",
        }}
      >
        <span
          style={{
            width: "18px",
            height: "18px",
            border: "2px solid var(--border-color)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
        Loading Farmio…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
