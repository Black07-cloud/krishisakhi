import { useEffect } from "react";
import { X, FlaskConical, Calendar, FileText, Sparkles, CheckCircle2 } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const SoilDetailsModal = ({ record, farm, intelligence, onClose, onEdit }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const {
    ph,
    nitrogen,
    phosphorus,
    potassium,
    organicCarbon,
    micronutrients,
    source,
    testedAt,
    notes,
    createdAt,
  } = record;

  const farmName = farm?.name || "Farm";
  const micros = micronutrients || {};

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="soil-details-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">🧪</span>
            <div>
              <h2 id="soil-details-title" className="modal-title">
                Soil Test Record Details
              </h2>
              <span className="modal-subtitle-text">{farmName} • Tested {formatDate(testedAt)}</span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status & Source Bar */}
          <div className="details-status-bar">
            <span className="source-tag">Source: {capitalize(source || "manual")}</span>
            <span className="details-id-text">Record ID: {record._id}</span>
          </div>

          {/* Primary Parameters Grid */}
          <div className="soil-modal-params-grid">
            <div className="modal-param-box">
              <span className="m-param-label">pH Level</span>
              <span className="m-param-val">{ph !== undefined && ph !== null ? ph : "Not available"}</span>
            </div>

            <div className="modal-param-box">
              <span className="m-param-label">Nitrogen (N)</span>
              <span className="m-param-val">{nitrogen !== undefined && nitrogen !== null ? nitrogen : "Not available"}</span>
            </div>

            <div className="modal-param-box">
              <span className="m-param-label">Phosphorus (P)</span>
              <span className="m-param-val">{phosphorus !== undefined && phosphorus !== null ? phosphorus : "Not available"}</span>
            </div>

            <div className="modal-param-box">
              <span className="m-param-label">Potassium (K)</span>
              <span className="m-param-val">{potassium !== undefined && potassium !== null ? potassium : "Not available"}</span>
            </div>

            <div className="modal-param-box">
              <span className="m-param-label">Organic Carbon</span>
              <span className="m-param-val">{organicCarbon !== undefined && organicCarbon !== null ? `${organicCarbon}%` : "Not available"}</span>
            </div>
          </div>

          {/* Micronutrients Section */}
          <div className="details-section">
            <h4 className="details-section-title">
              <Sparkles size={16} /> Micronutrients
            </h4>
            <div className="micronutrients-grid">
              <div className="micro-item">
                <span className="micro-label">Zinc (Zn):</span>
                <span className="micro-val">{micros.zinc !== undefined && micros.zinc !== null ? micros.zinc : "Not available"}</span>
              </div>
              <div className="micro-item">
                <span className="micro-label">Iron (Fe):</span>
                <span className="micro-val">{micros.iron !== undefined && micros.iron !== null ? micros.iron : "Not available"}</span>
              </div>
              <div className="micro-item">
                <span className="micro-label">Manganese (Mn):</span>
                <span className="micro-val">{micros.manganese !== undefined && micros.manganese !== null ? micros.manganese : "Not available"}</span>
              </div>
              <div className="micro-item">
                <span className="micro-label">Copper (Cu):</span>
                <span className="micro-val">{micros.copper !== undefined && micros.copper !== null ? micros.copper : "Not available"}</span>
              </div>
              <div className="micro-item">
                <span className="micro-label">Boron (B):</span>
                <span className="micro-val">{micros.boron !== undefined && micros.boron !== null ? micros.boron : "Not available"}</span>
              </div>
            </div>
          </div>

          {/* Backend Fertilizer & AI Recommendation if available */}
          {intelligence?.fertilizerRecommendation && (
            <div className="soil-fertilizer-box">
              <h4 className="fertilizer-title">
                <CheckCircle2 size={16} color="#16a34a" /> Fertilizer Guidance
              </h4>
              <p className="fertilizer-text">
                {typeof intelligence.fertilizerRecommendation === "string"
                  ? intelligence.fertilizerRecommendation
                  : intelligence.fertilizerRecommendation.recommendation || JSON.stringify(intelligence.fertilizerRecommendation)}
              </p>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="details-section">
              <h4 className="details-section-title">
                <FileText size={16} /> Notes & Remarks
              </h4>
              <div className="notes-box">{notes}</div>
            </div>
          )}

          <div className="details-dates-footer">
            <div className="date-info">
              <Calendar size={13} /> Tested: {formatDate(testedAt)}
            </div>
            <div className="date-info">
              <Calendar size={13} /> Recorded: {formatDate(createdAt)}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
            >
              Edit Soil Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilDetailsModal;
