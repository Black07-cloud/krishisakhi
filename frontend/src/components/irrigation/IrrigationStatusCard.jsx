import { Droplets, CloudSun, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const DECISION_STYLES = {
  irrigate: {
    badge: "badge-irrigate",
    title: "Irrigation Recommended",
    icon: Droplets,
    color: "#2563eb",
  },
  delay: {
    badge: "badge-delay",
    title: "Delay Irrigation",
    icon: Info,
    color: "#d97706",
  },
  monitor: {
    badge: "badge-monitor",
    title: "Monitor Weather & Soil",
    icon: CloudSun,
    color: "#059669",
  },
};

const PRIORITY_BADGES = {
  urgent: "prio-urgent",
  high: "prio-high",
  normal: "prio-normal",
  low: "prio-low",
};

const IrrigationStatusCard = ({ farmIrrigationData, loading = false, farmName }) => {
  if (loading) {
    return (
      <div className="irrigation-status-card skeleton-card" style={{ height: "200px" }} />
    );
  }

  if (!farmIrrigationData) {
    return (
      <div className="irrigation-status-card empty-status-card">
        <div className="status-icon-wrap">
          <Droplets size={28} color="#0284c7" />
        </div>
        <div className="status-empty-text">
          <h3>No Irrigation Recommendation Available</h3>
          <p>
            Ensure <strong>{farmName || "this farm"}</strong> has GPS coordinates and a crop assigned to receive automated weather-adjusted irrigation recommendations.
          </p>
        </div>
      </div>
    );
  }

  const {
    crop,
    weather,
    forecast,
    irrigation,
  } = farmIrrigationData;

  const decisionKey = (irrigation?.decision || "irrigate").toLowerCase();
  const styleConfig = DECISION_STYLES[decisionKey] || DECISION_STYLES.irrigate;
  const Icon = styleConfig.icon;

  const priorityKey = (irrigation?.priority || "normal").toLowerCase();
  const priorityClass = PRIORITY_BADGES[priorityKey] || "prio-normal";

  return (
    <div className={`irrigation-status-card decision-${decisionKey}`}>
      <div className="status-card-header">
        <div className="status-title-wrap">
          <div className="status-decision-icon" style={{ backgroundColor: `${styleConfig.color}15` }}>
            <Icon size={24} color={styleConfig.color} />
          </div>
          <div>
            <div className="badge-row">
              <span className={`decision-badge ${styleConfig.badge}`}>
                {styleConfig.title}
              </span>
              <span className={`priority-badge ${priorityClass}`}>
                Priority: {capitalize(priorityKey)}
              </span>
            </div>
            <h2 className="farm-irr-name">{farmName}</h2>
          </div>
        </div>

        {weather && (
          <div className="weather-summary-pill">
            <CloudSun size={16} color="#0284c7" />
            <span>
              {weather.temperature}°C, {weather.weather} ({weather.humidity}% Humidity)
            </span>
          </div>
        )}
      </div>

      <div className="status-card-body">
        {irrigation?.reason && (
          <div className="reason-box">
            <span className="reason-label">Reason:</span>
            <p className="reason-text">{irrigation.reason}</p>
          </div>
        )}

        {irrigation?.waterSavingAdvice && (
          <div className="advice-box">
            <span className="advice-label">Water Saving Advice:</span>
            <p className="advice-text">{irrigation.waterSavingAdvice}</p>
          </div>
        )}
      </div>

      <div className="status-card-footer">
        {crop ? (
          <span className="footer-meta-item">
            🌱 Active Crop: <strong>{crop.name}</strong> {crop.variety ? `(${crop.variety})` : ""}
          </span>
        ) : (
          <span className="footer-meta-item">🌱 No active crop assigned</span>
        )}

        {forecast && (
          <span className="footer-meta-item">
            🌧️ Rain Forecast: <strong>{forecast.rainProbability}% probability</strong> ({forecast.weather})
          </span>
        )}
      </div>
    </div>
  );
};

export default IrrigationStatusCard;
