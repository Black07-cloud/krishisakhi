import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  Wind,
  Droplets,
  Gauge,
  Thermometer,
  RefreshCw,
  MapPin,
} from "lucide-react";

/**
 * Returns suitable Lucide weather icon based on OpenWeather main condition string
 */
export const getWeatherIcon = (condition, size = 32) => {
  const cond = condition ? condition.toLowerCase() : "";

  if (cond.includes("clear")) return <Sun size={size} color="#f59e0b" />;
  if (cond.includes("cloud")) return <CloudSun size={size} color="#0284c7" />;
  if (cond.includes("rain")) return <CloudRain size={size} color="#2563eb" />;
  if (cond.includes("drizzle"))
    return <CloudDrizzle size={size} color="#38bdf8" />;
  if (cond.includes("thunderstorm"))
    return <CloudLightning size={size} color="#7c3aed" />;
  if (cond.includes("snow")) return <Snowflake size={size} color="#06b6d4" />;
  if (cond.includes("mist") || cond.includes("fog") || cond.includes("haze"))
    return <CloudFog size={size} color="#64748b" />;

  return <CloudSun size={size} color="#16a34a" />;
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const CurrentWeatherCard = ({
  weatherData,
  farm,
  fetchedAt,
  onRefresh,
  refreshing = false,
}) => {
  if (!weatherData) return null;

  const {
    location,
    temperature,
    feelsLike,
    humidity,
    pressure,
    windSpeed,
    weather,
    description,
    rainfall,
  } = weatherData;

  const displayLocation =
    location ||
    farm?.location?.village ||
    farm?.location?.district ||
    farm?.name ||
    "Farm Location";

  return (
    <div className="current-weather-hero-card">
      <div className="weather-hero-header">
        <div className="location-group">
          <MapPin size={18} color="#16a34a" />
          <h2 className="location-name">{displayLocation}</h2>
          {farm?.name && (
            <span className="farm-tag-pill">Farm: {farm.name}</span>
          )}
        </div>

        <div className="weather-hero-actions">
          {fetchedAt && (
            <span className="fetched-at-text">
              Fetched:{" "}
              {fetchedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            type="button"
            className="btn-refresh-weather"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh weather data"
            title="Refresh weather data"
          >
            <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="weather-hero-body">
        <div className="temp-condition-box">
          <div className="weather-icon-large">
            {getWeatherIcon(weather, 56)}
          </div>
          <div className="temp-numbers">
            <span className="temp-main">
              {temperature !== undefined
                ? `${Math.round(temperature)}°C`
                : "N/A"}
            </span>
            <span className="temp-feels">
              Feels like{" "}
              {feelsLike !== undefined ? `${Math.round(feelsLike)}°C` : "N/A"}
            </span>
          </div>
        </div>

        <div className="condition-text-box">
          <span className="condition-main">{weather || "Clear"}</span>
          <span className="condition-desc">
            {capitalize(description || "")}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="weather-metrics-grid">
        <div className="weather-metric-item">
          <div className="metric-icon-wrap icon-blue">
            <Droplets size={18} />
          </div>
          <div className="metric-info">
            <span className="m-label">Humidity</span>
            <span className="m-val">
              {humidity !== undefined ? `${humidity}%` : "Not available"}
            </span>
          </div>
        </div>

        <div className="weather-metric-item">
          <div className="metric-icon-wrap icon-cyan">
            <Wind size={18} />
          </div>
          <div className="metric-info">
            <span className="m-label">Wind Speed</span>
            <span className="m-val">
              {windSpeed !== undefined ? `${windSpeed} m/s` : "Not available"}
            </span>
          </div>
        </div>

        <div className="weather-metric-item">
          <div className="metric-icon-wrap icon-indigo">
            <CloudRain size={18} />
          </div>
          <div className="metric-info">
            <span className="m-label">Rainfall</span>
            <span className="m-val">
              {rainfall !== undefined ? `${rainfall} mm` : "0 mm"}
            </span>
          </div>
        </div>

        <div className="weather-metric-item">
          <div className="metric-icon-wrap icon-slate">
            <Gauge size={18} />
          </div>
          <div className="metric-info">
            <span className="m-label">Pressure</span>
            <span className="m-val">
              {pressure !== undefined ? `${pressure} hPa` : "Not available"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
