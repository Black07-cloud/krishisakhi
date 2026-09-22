import { Link } from "react-router-dom";
import { CloudSun, Wind, Droplets, Thermometer, RefreshCw } from "lucide-react";
import { capitalize } from "./dashboardUtils";

const WeatherCard = ({ weather, loading, error, onRetry }) => {
  const renderBody = () => {
    if (loading) {
      return (
        <div className="weather-body">
          <div className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 12 }} />
          <div className="skeleton-line" style={{ width: "70%", marginBottom: 8 }} />
          <div className="skeleton-line" style={{ width: "50%" }} />
        </div>
      );
    }

    if (error || !weather) {
      return (
        <div className="card-error">
          <CloudSun size={16} color="var(--text-muted)" />
          <span>Weather unavailable</span>
          {onRetry && (
            <button className="btn-retry" onClick={onRetry}>
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="weather-body">
        <div className="weather-main">
          <CloudSun size={44} color="#2563eb" />
          <div className="weather-info">
            <h4>{weather.temperature != null ? `${Math.round(weather.temperature)}°C` : "—"}</h4>
            <p>{capitalize(weather.description || weather.weather || "—")}</p>
            {weather.location && (
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>
                {weather.location}
              </p>
            )}
          </div>
        </div>
        <div className="weather-meta-grid">
          <div className="weather-meta-item">
            <Droplets size={13} color="var(--text-muted)" />
            <span>Humidity: {weather.humidity != null ? `${weather.humidity}%` : "—"}</span>
          </div>
          <div className="weather-meta-item">
            <Wind size={13} color="var(--text-muted)" />
            <span>Wind: {weather.windSpeed != null ? `${weather.windSpeed} km/h` : "—"}</span>
          </div>
          <div className="weather-meta-item">
            <Thermometer size={13} color="var(--text-muted)" />
            <span>Feels: {weather.feelsLike != null ? `${Math.round(weather.feelsLike)}°C` : "—"}</span>
          </div>
          <div className="weather-meta-item">
            <Droplets size={13} color="var(--text-muted)" />
            <span>Rain: {weather.rainfall != null ? `${weather.rainfall} mm` : "—"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <span className="section-card-title">
          <CloudSun size={15} color="#2563eb" />
          Weather
        </span>
        <Link to="/weather" className="section-card-link">
          View full →
        </Link>
      </div>
      {renderBody()}
    </div>
  );
};

export default WeatherCard;
