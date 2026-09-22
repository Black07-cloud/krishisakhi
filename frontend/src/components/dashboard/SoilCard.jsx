import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { fmtDate } from "./dashboardUtils";

const SoilCard = ({ soil, loading }) => {
  const renderBody = () => {
    if (loading) {
      return (
        <div className="soil-body">
          <div className="skeleton" style={{ height: 72, borderRadius: 8 }} />
        </div>
      );
    }

    if (!soil) {
      return (
        <div className="empty-state" style={{ padding: "20px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            No soil record available.
          </p>
          <Link to="/soil" className="btn-empty-action" style={{ fontSize: "12px", padding: "6px 12px" }}>
            Add Soil Record
          </Link>
        </div>
      );
    }

    const metrics = [
      { label: "pH",   val: soil.ph != null ? soil.ph : "—" },
      { label: "N",    val: soil.nitrogen != null ? soil.nitrogen : "—" },
      { label: "P",    val: soil.phosphorus != null ? soil.phosphorus : "—" },
      { label: "K",    val: soil.potassium != null ? soil.potassium : "—" },
      { label: "OC",   val: soil.organicCarbon != null ? soil.organicCarbon : "—" },
    ].filter((m) => m.val !== "—");

    return (
      <div className="soil-body">
        {soil.testedAt && (
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>
            Tested on {fmtDate(soil.testedAt)}
          </p>
        )}
        <div className="soil-metrics-grid">
          {metrics.map((m) => (
            <div className="soil-metric-item" key={m.label}>
              <div className="soil-metric-label">{m.label}</div>
              <div className="soil-metric-value">{m.val}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <span className="section-card-title">
          <FlaskConical size={15} color="#92400e" />
          Soil Health
        </span>
        <Link to="/soil" className="section-card-link">View →</Link>
      </div>
      {renderBody()}
    </div>
  );
};

export default SoilCard;
