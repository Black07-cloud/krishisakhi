import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout/AppLayout";

// Pages
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import Farms from "../pages/Farms";
import Crops from "../pages/Crops";
import Soil from "../pages/Soil";
import Weather from "../pages/Weather";
import Irrigation from "../pages/Irrigation";
import Tasks from "../pages/Tasks";
import Disease from "../pages/Disease";
import Schemes from "../pages/Schemes";
import AI from "../pages/AI";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

// Loading component
const LoadingScreen = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--content-bg)",
    }}
  >
    <div
      style={{
        padding: "12px 24px",
        borderRadius: "999px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        fontWeight: "600",
        color: "var(--color-primary)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      Loading Farmio...
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

// Public only route wrapper (for login & register)
const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Public Only Auth Routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected App Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/soil" element={<Soil />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/irrigation" element={<Irrigation />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/disease" element={<Disease />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/ai" element={<AI />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
