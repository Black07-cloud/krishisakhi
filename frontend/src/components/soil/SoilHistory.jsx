import { Calendar, Eye, Edit, Trash2, FlaskConical } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const SoilHistory = ({ records = [], onView, onEdit, onDelete, loading = false }) => {
  if (loading) {
    return (
      <div className="soil-history-skeleton">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="soil-history-empty">
        <p>No historical soil records found for this farm.</p>
      </div>
    );
  }

  return (
    <div className="soil-history-container">
      <div className="history-section-header">
        <h3 className="history-section-title">
          <Calendar size={18} /> Soil Test History ({records.length})
        </h3>
      </div>

      {/* Desktop Table View */}
      <div className="history-table-wrapper">
        <table className="soil-table">
          <thead>
            <tr>
              <th>Test Date</th>
              <th>pH</th>
              <th>Nitrogen (N)</th>
              <th>Phosphorus (P)</th>
              <th>Potassium (K)</th>
              <th>Organic Carbon</th>
              <th>Source</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec._id}>
                <td className="font-semibold">{formatDate(rec.testedAt)}</td>
                <td>
                  <span className="table-badge ph-badge">
                    {rec.ph ?? "N/A"}
                  </span>
                </td>
                <td>{rec.nitrogen ?? "N/A"}</td>
                <td>{rec.phosphorus ?? "N/A"}</td>
                <td>{rec.potassium ?? "N/A"}</td>
                <td>{rec.organicCarbon !== undefined && rec.organicCarbon !== null ? `${rec.organicCarbon}%` : "N/A"}</td>
                <td>
                  <span className="source-tag">{capitalize(rec.source || "manual")}</span>
                </td>
                <td className="text-right">
                  <div className="action-buttons-group">
                    <button
                      type="button"
                      className="btn-icon action-view"
                      onClick={() => onView(rec)}
                      aria-label="View soil record details"
                      title="View details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon action-edit"
                      onClick={() => onEdit(rec)}
                      aria-label="Edit soil record"
                      title="Edit record"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon action-delete"
                      onClick={() => onDelete(rec)}
                      aria-label="Delete soil record"
                      title="Delete record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="history-mobile-cards">
        {records.map((rec) => (
          <div key={rec._id} className="soil-history-mobile-card">
            <div className="mobile-card-header">
              <span className="mobile-card-date">
                <Calendar size={13} /> {formatDate(rec.testedAt)}
              </span>
              <span className="source-tag">{capitalize(rec.source || "manual")}</span>
            </div>

            <div className="mobile-card-metrics">
              <div className="mobile-metric">
                <span className="m-label">pH:</span>
                <span className="m-val">{rec.ph ?? "N/A"}</span>
              </div>
              <div className="mobile-metric">
                <span className="m-label">N:</span>
                <span className="m-val">{rec.nitrogen ?? "N/A"}</span>
              </div>
              <div className="mobile-metric">
                <span className="m-label">P:</span>
                <span className="m-val">{rec.phosphorus ?? "N/A"}</span>
              </div>
              <div className="mobile-metric">
                <span className="m-label">K:</span>
                <span className="m-val">{rec.potassium ?? "N/A"}</span>
              </div>
              <div className="mobile-metric">
                <span className="m-label">OC:</span>
                <span className="m-val">{rec.organicCarbon !== undefined && rec.organicCarbon !== null ? `${rec.organicCarbon}%` : "N/A"}</span>
              </div>
            </div>

            <div className="mobile-card-actions">
              <button
                type="button"
                className="btn-card-action action-view"
                onClick={() => onView(rec)}
              >
                <Eye size={14} /> View
              </button>
              <button
                type="button"
                className="btn-card-action action-edit"
                onClick={() => onEdit(rec)}
              >
                <Edit size={14} /> Edit
              </button>
              <button
                type="button"
                className="btn-card-action action-delete"
                onClick={() => onDelete(rec)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoilHistory;
