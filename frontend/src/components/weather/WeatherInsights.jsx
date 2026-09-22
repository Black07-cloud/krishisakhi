import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Droplets, Bot, ArrowRight, Wind, Thermometer, CloudRain } from "lucide-react";

/**
 * Derive factual insights from actual weather & forecast data
 */
const deriveInsights = (current, forecastData) => {
  const insights = [];
  if (!current) return insights;

  const temp = Number(current.temperature) || 0;
  const wind = Number(current.windSpeed) || 0;
  const rain = Number(current.rainfall) || 0;
  const weatherStr = (current.weather || "").toLowerCase();

  // 1. Rainfall observation
  if (rain > 0 || weatherStr.includes("rain") || weatherStr.includes("drizzle") || weatherStr.includes("thunderstorm")) {
    insights.push({
      type: "warning",
      icon: CloudRain,
      title: "Rain Currently Reported",
      message: `Precipitation of ${rain} mm observed. Check farm field drainage and avoid fertilizer application during active rain.`,
    });
  } else {
    // Check forecast for rain in upcoming 24h
    const upcomingRain = (forecastData?.forecast || []).slice(0, 8).find(
      (item) => item.rainProbability >= 60 || (item.weather || "").toLowerCase().includes("rain")
    );
    if (upcomingRain) {
      insights.push({
        type: "info",
        icon: CloudRain,
        title: "Rain Expected in Forecast",
        message: `High rain probability (${upcomingRain.rainProbability}%) expected around ${upcomingRain.dateTime}. Plan spraying and field activities accordingly.`,
      });
    } else {
      insights.push({
        type: "success",
        icon: CheckCircle2,
        title: "No Immediate Heavy Rain",
        message: "No heavy rainfall detected in immediate forecast. Good conditions for routine field maintenance.",
      });
    }
  }

  // 2. High Temperature observation
  if (temp >= 35) {
    insights.push({
      type: "warning",
      icon: Thermometer,
      title: "High Temperature Warning",
      message: `Current temperature is ${Math.round(temp)}°C. High heat increases soil evapotranspiration; monitor crop moisture closely.`,
    });
  }

  // 3. Strong Wind observation
  if (wind >= 10) {
    insights.push({
      type: "warning",
      icon: Wind,
      title: "Strong Wind Gusts",
      message: `Wind speed is currently ${wind} m/s. Secure vulnerable structures, greenhouse film, and young crop stalks.`,
    });
  }

  return insights;
};

const WeatherInsights = ({ currentWeather, forecastData }) => {
  const insights = deriveInsights(currentWeather, forecastData);

  return (
    <div className="weather-insights-grid">
      {/* Weather Insights Section */}
      <div className="insights-card">
        <div className="insights-card-header">
          <h3 className="section-title">
            <AlertCircle size={18} color="#16a34a" /> Farm Weather Insights
          </h3>
          <span className="insights-tag">Factual Observations</span>
        </div>

        <div className="insights-list">
          {insights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`insight-item insight-${item.type}`}>
                <div className="insight-icon">
                  <Icon size={18} />
                </div>
                <div className="insight-text-wrap">
                  <span className="insight-title">{item.title}</span>
                  <p className="insight-message">{item.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="insights-ai-footer">
          <p>For personalized crop recommendations based on weather:</p>
          <Link to="/ai" className="btn-insight-ai">
            <Bot size={15} />
            <span>Ask Farmio AI</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Plan Irrigation Shortcut Box */}
      <div className="irrigation-shortcut-card">
        <div className="irrigation-card-header">
          <div className="irrigation-icon-wrap">
            <Droplets size={24} color="#0284c7" />
          </div>
          <div>
            <h3 className="irrigation-card-title">Plan Irrigation</h3>
            <p className="irrigation-card-sub">
              Use current weather and forecast information when planning irrigation schedules for your farms.
            </p>
          </div>
        </div>

        <Link to="/irrigation" className="btn btn-primary btn-full-width">
          <Droplets size={16} /> Open Irrigation Module
        </Link>
      </div>
    </div>
  );
};

export default WeatherInsights;
