import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Sprout,
  ClipboardList,
  FlaskConical,
  CloudSun,
  Droplets,
  Bot,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../api/dashboardApi";
import FarmRow from "../../components/dashboard/FarmRow";
import CropRow from "../../components/dashboard/CropRow";
import TaskRow from "../../components/dashboard/TaskRow";
import WeatherCard from "../../components/dashboard/WeatherCard";
import SoilCard from "../../components/dashboard/SoilCard";
import IrrigationCard from "../../components/dashboard/IrrigationCard";
import { getGreeting } from "../../components/dashboard/dashboardUtils";
import "./Dashboard.css";

/* ── Quick action config ────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    to: "/farms",
    icon: MapPin,
    label: "My Farms",
    bg: "#dcfce7",
    color: "#16a34a",
  },
  {
    to: "/crops",
    icon: Sprout,
    label: "Crops",
    bg: "#d1fae5",
    color: "#059669",
  },
  {
    to: "/soil",
    icon: FlaskConical,
    label: "Soil",
    bg: "#fef3c7",
    color: "#92400e",
  },
  {
    to: "/weather",
    icon: CloudSun,
    label: "Weather",
    bg: "#dbeafe",
    color: "#2563eb",
  },
  {
    to: "/irrigation",
    icon: Droplets,
    label: "Irrigation",
    bg: "#e0f2fe",
    color: "#0369a1",
  },
  {
    to: "/ai",
    icon: Bot,
    label: "AI Assistant",
    bg: "#f0fdf4",
    color: "#16a34a",
  },
];

const AI_CHIPS = ["Crop Advice", "Irrigation", "Soil", "Weather", "Disease"];

/* ── Stat card skeleton ─────────────────────────────────────── */
const StatCardSkeleton = ({ label, icon: Icon, iconBg, iconColor }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <div className="stat-card-icon" style={{ background: iconBg }}>
        <Icon size={18} color={iconColor} />
      </div>
    </div>
    <div className="stat-card-value loading" />
    <div className="stat-card-sub skeleton-line" style={{ width: "60%" }} />
  </div>
);

/* ── Stat card real ─────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <div className="stat-card-icon" style={{ background: iconBg }}>
        <Icon size={18} color={iconColor} />
      </div>
    </div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-sub">{sub}</div>
  </div>
);

/* ── Main Dashboard ─────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboard();
      if (res?.success) {
        setDashData(res.data);
      } else {
        setError(res?.message || "Failed to load dashboard.");
      }
    } catch (err) {
      setError(
        err?.data?.message || err?.message || "Failed to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Derived values from backend response
  const summary = dashData?.summary;
  const farmBoards = dashData?.farms ?? []; // array of { farm, crop, soil, weather, irrigation, tasks }
  const allCrops = farmBoards
    .filter((fb) => fb.crop)
    .map((fb) => ({ crop: fb.crop, farmName: fb.farm?.name }));
  const allTasks = farmBoards.flatMap((fb) => fb.tasks?.pending ?? []);
  // Use weather/soil/irrigation from first farm that has them
  const firstFarmWithWeather = farmBoards.find((fb) => fb.weather);
  const firstFarmWithSoil = farmBoards.find((fb) => fb.soil);
  const firstFarmWithIrrigation = farmBoards.find((fb) => fb.irrigation);

  // Urgent tasks for Attention section
  const urgentTasks = allTasks.filter(
    (t) => t.priority === "urgent" || t.priority === "high",
  );

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard">
      {/* ── Welcome Header ─────────────────────────────────── */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h2>
            {getGreeting()}, {user?.name || "Farmer"} 👋
          </h2>
          <p>Here's what's happening on your farm today.</p>
        </div>
        <div className="dashboard-date">{todayStr}</div>
      </div>

      {/* ── Global Error Banner ────────────────────────────── */}
      {error && !loading && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "var(--border-radius-sm)",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            color: "#991b1b",
          }}
        >
          <AlertTriangle size={16} />
          {error}
          <button
            className="btn-retry"
            onClick={fetchDashboard}
            style={{ marginLeft: "auto" }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="stats-grid">
        {loading ? (
          <>
            <StatCardSkeleton
              label="My Farms"
              icon={MapPin}
              iconBg="#dcfce7"
              iconColor="#16a34a"
            />
            <StatCardSkeleton
              label="Active Crops"
              icon={Sprout}
              iconBg="#d1fae5"
              iconColor="#059669"
            />
            <StatCardSkeleton
              label="Pending Tasks"
              icon={ClipboardList}
              iconBg="#fef3c7"
              iconColor="#d97706"
            />
            <StatCardSkeleton
              label="Soil Records"
              icon={FlaskConical}
              iconBg="#fef9c3"
              iconColor="#92400e"
            />
          </>
        ) : (
          <>
            <StatCard
              label="My Farms"
              value={summary?.farmCount ?? 0}
              sub={
                summary?.farmCount === 0
                  ? "Add your first farm"
                  : `${summary.farmCount} active farm${summary.farmCount !== 1 ? "s" : ""}`
              }
              icon={MapPin}
              iconBg="#dcfce7"
              iconColor="#16a34a"
            />
            <StatCard
              label="Active Crops"
              value={summary?.activeCropCount ?? 0}
              sub={
                summary?.activeCropCount === 0
                  ? "No crops tracked yet"
                  : `Across ${summary.farmCount} farm${summary.farmCount !== 1 ? "s" : ""}`
              }
              icon={Sprout}
              iconBg="#d1fae5"
              iconColor="#059669"
            />
            <StatCard
              label="Pending Tasks"
              value={summary?.pendingTaskCount ?? 0}
              sub={
                summary?.pendingTaskCount === 0
                  ? "All caught up!"
                  : `${summary.automationTaskCount ?? 0} auto-generated`
              }
              icon={ClipboardList}
              iconBg="#fef3c7"
              iconColor="#d97706"
            />
            <StatCard
              label="Soil Records"
              value={summary?.hasSoilData ? "✓" : "—"}
              sub={
                summary?.hasSoilData
                  ? "Soil data available"
                  : "No soil records yet"
              }
              icon={FlaskConical}
              iconBg="#fef9c3"
              iconColor="#92400e"
            />
          </>
        )}
      </div>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div className="dashboard-left">
          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">Quick Actions</span>
            </div>
            <div className="quick-actions-grid">
              {QUICK_ACTIONS.map(({ to, icon: Icon, label, bg, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="quick-action-btn"
                  id={`quick-action-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="quick-action-icon" style={{ background: bg }}>
                    <Icon size={20} color={color} />
                  </div>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* My Farms */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">
                <MapPin size={15} color="#16a34a" />
                My Farms
              </span>
              <Link to="/farms" className="section-card-link">
                Manage →
              </Link>
            </div>
            {loading ? (
              <div style={{ padding: "16px 18px" }}>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "14px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="skeleton"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="skeleton-line"
                        style={{ width: "55%", marginBottom: 6 }}
                      />
                      <div className="skeleton-line" style={{ width: "80%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : farmBoards.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MapPin size={22} color="var(--text-muted)" />
                </div>
                <h4>No farms yet</h4>
                <p>
                  Add your first farm to start tracking crops, soil, and
                  weather.
                </p>
                <Link to="/farms" className="btn-empty-action">
                  Add Farm
                </Link>
              </div>
            ) : (
              <div className="farms-list">
                {farmBoards.map((fb) => (
                  <FarmRow key={fb.farm?.id} farmDashboard={fb} />
                ))}
              </div>
            )}
          </div>

          {/* Active Crops */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">
                <Sprout size={15} color="#059669" />
                Active Crops
              </span>
              <Link to="/crops" className="section-card-link">
                View all →
              </Link>
            </div>
            {loading ? (
              <div style={{ padding: "16px 18px" }}>
                <div
                  className="skeleton"
                  style={{ height: 60, borderRadius: 8 }}
                />
              </div>
            ) : allCrops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Sprout size={22} color="var(--text-muted)" />
                </div>
                <h4>No active crops</h4>
                <p>Add a crop to start tracking its lifecycle.</p>
                <Link to="/crops" className="btn-empty-action">
                  Add Crop
                </Link>
              </div>
            ) : (
              <div className="crops-list">
                {allCrops.map(({ crop, farmName }, i) => (
                  <CropRow key={crop.id || i} crop={crop} farmName={farmName} />
                ))}
              </div>
            )}
          </div>

          {/* Pending Tasks */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">
                <ClipboardList size={15} color="#d97706" />
                Pending Tasks
              </span>
              <Link to="/tasks" className="section-card-link">
                View all →
              </Link>
            </div>
            {loading ? (
              <div style={{ padding: "14px 18px" }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 12,
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="skeleton"
                      style={{
                        width: 3,
                        height: 40,
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="skeleton-line"
                        style={{ width: "60%", marginBottom: 6 }}
                      />
                      <div className="skeleton-line" style={{ width: "40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : allTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ClipboardList size={22} color="var(--text-muted)" />
                </div>
                <h4>No pending tasks</h4>
                <p>You're all caught up!</p>
              </div>
            ) : (
              <div className="tasks-list">
                {allTasks.slice(0, 6).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {allTasks.length > 6 && (
                  <div
                    style={{
                      padding: "10px 18px",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <Link to="/tasks" className="section-card-link">
                      +{allTasks.length - 6} more tasks →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attention Needed */}
          {!loading && urgentTasks.length > 0 && (
            <div className="section-card" style={{ borderColor: "#fca5a5" }}>
              <div
                className="section-card-header"
                style={{ background: "#fff5f5" }}
              >
                <span
                  className="section-card-title"
                  style={{ color: "#dc2626" }}
                >
                  <AlertTriangle size={15} color="#dc2626" />
                  Attention Needed
                </span>
              </div>
              <div className="tasks-list">
                {urgentTasks.slice(0, 3).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard-right">
          {/* Weather */}
          <WeatherCard
            weather={firstFarmWithWeather?.weather}
            loading={loading}
            error={null}
          />

          {/* Irrigation */}
          <IrrigationCard
            irrigation={firstFarmWithIrrigation?.irrigation}
            loading={loading}
          />

          {/* Soil Health */}
          <SoilCard soil={firstFarmWithSoil?.soil} loading={loading} />

          {/* AI Assistant Promo */}
          <div className="ai-card">
            <div className="ai-card-body">
              <div className="ai-card-header">
                <Bot size={20} color="#4ade80" />
                <span className="ai-card-title">Ask Farmio AI</span>
                <span className="ai-badge">NEW</span>
              </div>
              <p className="ai-card-desc">
                Get intelligent guidance about your crops, soil, weather,
                irrigation and farming tasks.
              </p>
              <div className="ai-quick-chips">
                {AI_CHIPS.map((chip) => (
                  <span key={chip} className="ai-quick-chip">
                    {chip}
                  </span>
                ))}
              </div>
              <Link to="/ai" className="btn-open-ai" id="dashboard-open-ai-btn">
                <Bot size={15} />
                Open AI Assistant
              </Link>
            </div>
          </div>

          {/* Govt Schemes */}
          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">Government Schemes</span>
              <Link to="/schemes" className="section-card-link">
                Browse →
              </Link>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Discover subsidies and government support programmes for
                farmers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
