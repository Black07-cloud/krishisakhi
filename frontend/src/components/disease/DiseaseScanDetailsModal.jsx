import { useEffect } from "react";
import { X, ShieldCheck, AlertTriangle, Calendar, FileText, Bot, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const SEVERITY_CLASSES = {
  healthy: "sev-healthy",
  mild: "sev-mild",
  moderate: "sev-moderate",
  severe: "sev-severe",
  unknown: "sev-unknown",
};

const renderListOrText = (data) => {
  if (!data) return "Not available";
  if (Array.isArray(data)) {
    if (data.length === 0) return "Not available";
    return (
      <ul className="result-bullet-list">
        {data.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="result-text">{data}</p>;
};

const DiseaseScanDetailsModal = ({ scan, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!scan) return null;

  const {
    imageUrl,
    detectedDisease,
    confidence,
    severity = "unknown",
    symptoms,
    treatment,
    organicTreatment,
    prevention,
    notes,
    status = "pending",
    scannedAt,
    farm,
    crop,
  } = scan;

  const farmName = typeof farm === "object" ? farm?.name : "Farm";
  const cropName = typeof crop === "object" ? crop?.name : "Crop";

  const sevClass = SEVERITY_CLASSES[severity] || "sev-unknown";

  const confidencePct =
    confidence !== null && confidence !== undefined
      ? confidence <= 1
        ? `${Math.round(confidence * 100)}%`
        : `${Math.round(confidence)}%`
      : "N/A";

  const isHealthy = severity === "healthy" || (detectedDisease && detectedDisease.toLowerCase().includes("healthy"));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="scan-details-modal-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">🌿</span>
            <div>
              <h2 id="scan-details-modal-title" className="modal-title">
                Scan Details
              </h2>
              <span className="modal-subtitle-text">{farmName} • {cropName}</span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-status-bar">
            <span className={`severity-badge ${sevClass}`}>
              Severity: {capitalize(severity)}
            </span>
            <span className="details-id-text">Scan ID: {scan._id}</span>
          </div>

          {imageUrl && (
            <div className="scanned-image-container modal-img-wrap">
              <img src={imageUrl} alt="Scanned crop leaf" className="scanned-leaf-img" />
            </div>
          )}

          <div className={`disease-hero-box ${isHealthy ? "hero-healthy" : "hero-disease"}`}>
            <div className="disease-name-wrap">
              <span className="hero-sublabel">Condition</span>
              <h3 className="disease-name-text">
                {isHealthy ? "Crop Appears Healthy" : detectedDisease || "Condition Unspecified"}
              </h3>
            </div>
            <div className="confidence-pill">
              <span>Confidence:</span>
              <strong>{confidencePct}</strong>
            </div>
          </div>

          {symptoms && (
            <div className="details-section">
              <h4 className="details-section-title">Symptoms Observed</h4>
              {renderListOrText(symptoms)}
            </div>
          )}

          {treatment && (
            <div className="details-section">
              <h4 className="details-section-title">Recommended Treatment</h4>
              {renderListOrText(treatment)}
            </div>
          )}

          {organicTreatment && (
            <div className="details-section">
              <h4 className="details-section-title">Organic Option</h4>
              {renderListOrText(organicTreatment)}
            </div>
          )}

          {prevention && (
            <div className="details-section">
              <h4 className="details-section-title">Prevention Guidelines</h4>
              {renderListOrText(prevention)}
            </div>
          )}

          {notes && (
            <div className="details-section">
              <h4 className="details-section-title">
                <FileText size={15} /> Notes
              </h4>
              <div className="notes-box">{notes}</div>
            </div>
          )}

          <div className="details-dates-footer">
            <div className="date-info">
              <Calendar size={13} /> Scanned: {formatDate(scannedAt)}
            </div>
            <div className="date-info">
              Status: <strong>{capitalize(status)}</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <Link to="/ai" className="btn btn-primary" onClick={onClose}>
            <Bot size={15} /> Ask Farmio AI
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiseaseScanDetailsModal;
