import { Link } from "react-router-dom";
import { Droplets, Bot, ArrowRight, CheckCircle2 } from "lucide-react";

const WaterSavingAdvice = ({ adviceText }) => {
  return (
    <div className="water-saving-section">
      {/* Water Saving Tips Card */}
      <div className="water-saving-card">
        <div className="saving-card-header">
          <div className="saving-icon-wrap">
            <Droplets size={22} color="#0284c7" />
          </div>
          <div>
            <h3 className="saving-title">Water Saving Recommendations</h3>
            <span className="saving-subtitle">Weather-adjusted efficiency tips</span>
          </div>
        </div>

        <div className="saving-body">
          {adviceText ? (
            <div className="advice-highlight-box">
              <CheckCircle2 size={18} color="#16a34a" />
              <p>{adviceText}</p>
            </div>
          ) : (
            <p className="generic-advice-text">
              Prefer drip irrigation over flood irrigation during early morning or evening hours to minimize evaporation losses.
            </p>
          )}

          <ul className="saving-tips-list">
            <li>💧 Schedule irrigation during cooler hours (before 9 AM or after 5 PM).</li>
            <li>🌱 Monitor soil moisture levels before triggering automated watering.</li>
            <li>🌦️ Adjust schedules when rain is forecasted in the next 24 hours.</li>
          </ul>
        </div>
      </div>

      {/* Farmio AI Guidance Shortcut */}
      <div className="irrigation-ai-banner">
        <div className="ai-banner-content">
          <div className="ai-banner-icon">
            <Bot size={28} />
          </div>
          <div className="ai-banner-text">
            <h3>Need help with irrigation planning?</h3>
            <p>
              Farmio AI can assist you with custom crop water requirements, soil retention capacity, and weather insights.
            </p>
          </div>
        </div>

        <Link to="/ai" className="btn-ask-ai-irrigation">
          <span>Ask Farmio AI</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default WaterSavingAdvice;
