import { ShieldCheck, AlertTriangle, CheckCircle2, Info, Clock, Leaf, Bot, ArrowRight } from "lucide-react";
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

const SEVERITY_CONFIG = {
  healthy: { badge: "sev-healthy", label: "Healthy", color: "#16a34a", icon: ShieldCheck },
  mild: { badge: "sev-mild", label: "Mild Severity", color: "#eab308", icon: Info },
  moderate: { badge: "sev-moderate", label: "Moderate Severity", color: "#d97706", icon: AlertTriangle },
  severe: { badge: "sev-severe", label: "Severe Infection", color: "#dc2626", icon: AlertTriangle },
  unknown: { badge: "sev-unknown", label: "Unknown", color: "#64748b", icon: Info },
};

const renderListOrText = (data) => {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 0) return null;
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

const DiseaseResult = ({ scanResult, loading = false }) => {
  if (loading) {
    return (
      <div className="disease-result-card skeleton-card" style={{ height: "360px" }} />
    );
  }

  if (!scanResult) {
    return (
      <div className="disease-result-card empty-result-card">
        <div className="empty-result-icon">🌿</div>
        <h3 className="empty-result-title">No Active Scan Selected</h3>
        <p className="empty-result-desc">
          Upload a crop leaf photo on the left to analyze for potential crop diseases and receive recommended treatment.
        </p>
      </div>
    );
  }

  const {
    imageUrl,
    detectedDisease,
    confidence,
    severity = "unknown",
    symptoms,
    treatment,
    organicTreatment,
    prevention,
    status = "pending",
    scannedAt,
    farm,
    crop,
  } = scanResult;

  const farmName = typeof farm === "object" ? farm?.name : "Farm";
  const cropName = typeof crop === "object" ? crop?.name : "Crop";

  const sevKey = (severity || "unknown").toLowerCase();
  const sevConfig = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.unknown;
  const SevIcon = sevConfig.icon;

  const confidencePct =
    confidence !== null && confidence !== undefined
      ? confidence <= 1
        ? `${Math.round(confidence * 100)}%`
        : `${Math.round(confidence)}%`
      : null;

  const isHealthy = sevKey === "healthy" || (detectedDisease && detectedDisease.toLowerCase().includes("healthy"));

  return (
    <div className={`disease-result-card status-${status}`}>
      <div className="result-header">
        <div className="result-title-group">
          <Leaf size={22} color="#16a34a" />
          <div>
            <h3 className="result-card-title">Disease Analysis Result</h3>
            <span className="result-scanned-date">
              <Clock size={12} /> {formatDate(scannedAt)} • {farmName} ({cropName})
            </span>
          </div>
        </div>

        <span className={`severity-badge ${sevConfig.badge}`}>
          <SevIcon size={14} />
          {sevConfig.label}
        </span>
      </div>

      <div className="result-body">
        {/* Scanned Image Preview */}
        {imageUrl && (
          <div className="scanned-image-container">
            <img src={imageUrl} alt="Scanned crop leaf" className="scanned-leaf-img" />
          </div>
        )}

        {/* Status: Pending */}
        {status === "pending" && (
          <div className="status-banner pending-banner">
            <Clock size={18} />
            <div>
              <strong>Scan Submitted — Pending Analysis</strong>
              <p>Your leaf image has been safely uploaded and queued for disease detection.</p>
            </div>
          </div>
        )}

        {/* Status: Failed */}
        {status === "failed" && (
          <div className="status-banner failed-banner">
            <AlertTriangle size={18} />
            <div>
              <strong>Scan Analysis Failed</strong>
              <p>Unable to analyze this image. Please try uploading a clearer leaf photo.</p>
            </div>
          </div>
        )}

        {/* Status: Analyzed */}
        {status === "analyzed" && (
          <div className="analysis-output-container">
            {/* Disease & Confidence Hero Box */}
            <div className={`disease-hero-box ${isHealthy ? "hero-healthy" : "hero-disease"}`}>
              <div className="disease-name-wrap">
                <span className="hero-sublabel">Detected Condition</span>
                <h2 className="disease-name-text">
                  {isHealthy ? "Crop Appears Healthy" : detectedDisease || "Condition Unspecified"}
                </h2>
              </div>
              {confidencePct && (
                <div className="confidence-pill" title="AI Analysis Confidence">
                  <span>Confidence:</span>
                  <strong>{confidencePct}</strong>
                </div>
              )}
            </div>

            {/* Symptoms Section */}
            {symptoms && (Array.isArray(symptoms) ? symptoms.length > 0 : symptoms) && (
              <div className="result-info-section">
                <h4 className="section-subtitle">Observed Symptoms</h4>
                {renderListOrText(symptoms)}
              </div>
            )}

            {/* Recommended Treatment Section */}
            {treatment && (Array.isArray(treatment) ? treatment.length > 0 : treatment) && (
              <div className="result-info-section">
                <h4 className="section-subtitle">Recommended Treatment</h4>
                {renderListOrText(treatment)}
              </div>
            )}

            {/* Organic Treatment Section */}
            {organicTreatment && (Array.isArray(organicTreatment) ? organicTreatment.length > 0 : organicTreatment) && (
              <div className="result-info-section">
                <h4 className="section-subtitle">Organic Treatment Option</h4>
                {renderListOrText(organicTreatment)}
              </div>
            )}

            {/* Prevention Section */}
            {prevention && (Array.isArray(prevention) ? prevention.length > 0 : prevention) && (
              <div className="result-info-section">
                <h4 className="section-subtitle">Prevention & Management</h4>
                {renderListOrText(prevention)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Assistant Navigation Banner */}
      <div className="result-ai-footer">
        <div className="ai-footer-text">
          <Bot size={18} color="#16a34a" />
          <span>Need custom treatment advice for this crop?</span>
        </div>
        <Link to="/ai" className="btn-ask-ai-link">
          <span>Ask Farmio AI</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default DiseaseResult;
