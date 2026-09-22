import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { capitalize, IRRIGATION_COLOR } from "./dashboardUtils";

const IrrigationCard = ({ irrigation, loading }) => {
  const renderBody = () => {
    if (loading) {
      return (
        <div className="irrigation-body">
          <div className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 10 }} />
          <div className="skeleton-line" style={{ width: "90%" }} />
        </div>
      );
    }

    if (!irrigation) {
      return (
        <div className="empty-state" style={{ padding: "18px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            No irrigation data available.
          </p>
          <Link to="/irrigation" className="btn-empty-action" style={{ fontSize: "12px", padding: "6px 12px" }}>
            View Irrigation
          </Link>
        </div>
      );
    }

    const col = IRRIGATION_COLOR[irrigation.decision] ?? IRRIGATION_COLOR.irrigate;

    return (
      <div className="irrigation-body">
        <div className="irrigation-decision">
          <div className="irrigation-decision-icon" style={{ background: col.bg }}>
            <Droplets size={22} color={col.color} />
          </div>
          <div>
            <div className="irrigation-decision-label">Recommendation</div>
            <div className="irrigation-decision-value" style={{ color: col.color }}>
              {capitalize(irrigation.decision)}
            </div>
          </div>
          <span className={`badge ${irrigation.priority === "high" ? "badge-red" : irrigation.priority === "low" ? "badge-gray" : "badge-blue"}`}
            style={{ marginLeft: "auto", alignSelf: "flex-start" }}>
            {capitalize(irrigation.priority)}
          </span>
        </div>

        {irrigation.reason && (
          <div className="irrigation-reason">{irrigation.reason}</div>
        )}

        {irrigation.waterSavingAdvice && (
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", fontStyle: "italic" }}>
            💡 {irrigation.waterSavingAdvice}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <span className="section-card-title">
          <Droplets size={15} color="#2563eb" />
          Irrigation
        </span>
        <Link to="/irrigation" className="section-card-link">Manage →</Link>
      </div>
      {renderBody()}
    </div>
  );
};

export default IrrigationCard;
