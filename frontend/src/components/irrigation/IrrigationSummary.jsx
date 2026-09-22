import { Clock, CheckCircle2, AlertCircle, Droplets } from "lucide-react";

/**
 * Compute summary statistics from real irrigation tasks list
 */
const getIrrigationSummaryStats = (tasks = []) => {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;

  // Scheduled today
  const todayStr = new Date().toISOString().split("T")[0];
  const scheduledToday = tasks.filter((t) => {
    if (!t.dueAt) return false;
    const taskDateStr = new Date(t.dueAt).toISOString().split("T")[0];
    return taskDateStr === todayStr && t.status === "pending";
  }).length;

  return {
    total,
    pending,
    completed,
    cancelled,
    scheduledToday,
  };
};

const IrrigationSummary = ({ tasks = [], loading = false }) => {
  const stats = getIrrigationSummaryStats(tasks);

  return (
    <div className="irrigation-summary-grid">
      <div className="irrigation-summary-card">
        <div className="irrigation-summary-icon icon-blue">
          <Clock size={22} />
        </div>
        <div className="irrigation-summary-info">
          <span className="irrigation-summary-label">Scheduled Today</span>
          <span className="irrigation-summary-value">{loading ? "..." : stats.scheduledToday}</span>
        </div>
      </div>

      <div className="irrigation-summary-card">
        <div className="irrigation-summary-icon icon-amber">
          <AlertCircle size={22} />
        </div>
        <div className="irrigation-summary-info">
          <span className="irrigation-summary-label">Pending Irrigation</span>
          <span className="irrigation-summary-value">{loading ? "..." : stats.pending}</span>
        </div>
      </div>

      <div className="irrigation-summary-card">
        <div className="irrigation-summary-icon icon-green">
          <CheckCircle2 size={22} />
        </div>
        <div className="irrigation-summary-info">
          <span className="irrigation-summary-label">Completed</span>
          <span className="irrigation-summary-value">{loading ? "..." : stats.completed}</span>
        </div>
      </div>

      <div className="irrigation-summary-card">
        <div className="irrigation-summary-icon icon-cyan">
          <Droplets size={22} />
        </div>
        <div className="irrigation-summary-info">
          <span className="irrigation-summary-label">Total Irrigation Tasks</span>
          <span className="irrigation-summary-value">{loading ? "..." : stats.total}</span>
        </div>
      </div>
    </div>
  );
};

export default IrrigationSummary;
