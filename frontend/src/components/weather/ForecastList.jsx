import { Calendar, CloudRain, Droplets, Wind } from "lucide-react";
import { getWeatherIcon } from "./CurrentWeatherCard";

const formatForecastDate = (dateTimeStr) => {
  if (!dateTimeStr) return { day: "N/A", time: "" };
  try {
    const d = new Date(dateTimeStr.replace(" ", "T"));
    const day = d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { day, time };
  } catch {
    return { day: dateTimeStr, time: "" };
  }
};

const ForecastList = ({
  forecastData,
  loading = false,
  error = null,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="forecast-section">
        <h3 className="section-title">Weather Forecast</h3>
        <div className="forecast-skeleton-grid">
          <div className="skeleton-forecast-card" />
          <div className="skeleton-forecast-card" />
          <div className="skeleton-forecast-card" />
          <div className="skeleton-forecast-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forecast-section">
        <h3 className="section-title">Weather Forecast</h3>
        <div className="forecast-error-box">
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRetry}
            >
              Retry Forecast
            </button>
          )}
        </div>
      </div>
    );
  }

  const forecastList = forecastData?.forecast || [];

  if (forecastList.length === 0) {
    return (
      <div className="forecast-section">
        <h3 className="section-title">Weather Forecast</h3>
        <div className="forecast-empty-box">
          <p>No forecast data available for this farm location.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forecast-section">
      <div className="forecast-header">
        <h3 className="section-title">
          <Calendar size={18} /> Weather Forecast
        </h3>
        <span className="forecast-count-badge">Upcoming 5 Days</span>
      </div>

      <div className="forecast-scroll-container">
        {forecastList.map((item, idx) => {
          const { day, time } = formatForecastDate(item.dateTime);

          return (
            <div key={idx} className="forecast-card">
              <div className="forecast-card-header">
                <span className="fc-day">{day}</span>
                <span className="fc-time">{time}</span>
              </div>

              <div className="forecast-icon-wrap">
                {getWeatherIcon(item.weather, 36)}
              </div>

              <div className="forecast-temps">
                <span className="fc-temp">
                  {item.temperature !== undefined
                    ? `${Math.round(item.temperature)}°C`
                    : "N/A"}
                </span>
                <span className="fc-desc">{item.description}</span>
              </div>

              <div className="forecast-details-grid">
                {item.rainProbability !== undefined &&
                  item.rainProbability !== null && (
                    <div className="fc-detail-item" title="Rain probability">
                      <CloudRain size={13} color="#2563eb" />
                      <span>{item.rainProbability}%</span>
                    </div>
                  )}

                {item.humidity !== undefined && (
                  <div className="fc-detail-item" title="Humidity">
                    <Droplets size={13} color="#0284c7" />
                    <span>{item.humidity}%</span>
                  </div>
                )}

                {item.windSpeed !== undefined && (
                  <div className="fc-detail-item" title="Wind speed">
                    <Wind size={13} color="#64748b" />
                    <span>{item.windSpeed}m/s</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForecastList;
