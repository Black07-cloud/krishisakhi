import { FlaskConical, Droplets, Calendar, Sparkles, Plus, AlertCircle } from "lucide-react";

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

const SoilSummary = ({
  latestRecord,
  farm,
  intelligence,
  loading = false,
  onAddRecord,
}) => {
  if (loading) {
    return (
      <div className="soil-summary-skeleton">
        <div className="skeleton-card" />
      </div>
    );
  }

  if (!latestRecord) {
    return (
      <div className="soil-empty-report-card">
        <div className="empty-report-icon">🧪</div>
        <h3 className="empty-report-title">No soil test available yet</h3>
        <p className="empty-report-desc">
          Add your latest soil test record for <strong>{farm?.name || "this farm"}</strong> to monitor nutrients, pH, and get AI recommendations.
        </p>
        <button type="button" className="btn btn-primary" onClick={onAddRecord}>
          <Plus size={16} /> Add Soil Record
        </button>
      </div>
    );
  }

  const {
    ph,
    nitrogen,
    phosphorus,
    potassium,
    organicCarbon,
    source,
    testedAt,
  } = latestRecord;

  const analysis = intelligence?.analysis;

  return (
    <div className="soil-latest-report-wrapper">
      {/* Latest Report Header */}
      <div className="latest-report-header">
        <div className="report-title-group">
          <div className="report-icon-badge">
            <FlaskConical size={22} color="#16a34a" />
          </div>
          <div>
            <h2 className="report-title">Latest Soil Report</h2>
            <div className="report-meta">
              <span className="meta-item">
                <Calendar size={13} /> Tested: {formatDate(testedAt)}
              </span>
              <span className="meta-badge-source">
                Source: {capitalize(source || "manual")}
              </span>
              {farm?.soilType && (
                <span className="meta-badge-type">
                  Soil: {capitalize(farm.soilType)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-secondary" onClick={onAddRecord}>
          <Plus size={16} /> New Test Record
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="soil-metrics-grid">
        {/* pH Card */}
        <div className="soil-metric-card metric-ph">
          <div className="metric-header">
            <span className="metric-name">pH Level</span>
            <FlaskConical size={16} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-val">{ph !== undefined && ph !== null ? ph : "N/A"}</span>
            <span className="metric-sublabel">
              {analysis?.phCategory ? capitalize(analysis.phCategory) : "Acidity / Alkalinity"}
            </span>
          </div>
        </div>

        {/* Nitrogen Card */}
        <div className="soil-metric-card metric-n">
          <div className="metric-header">
            <span className="metric-name">Nitrogen (N)</span>
            <Droplets size={16} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-val">{nitrogen !== undefined && nitrogen !== null ? nitrogen : "N/A"}</span>
            <span className="metric-sublabel">
              {analysis?.nitrogenStatus ? capitalize(analysis.nitrogenStatus) : "Primary Nutrient"}
            </span>
          </div>
        </div>

        {/* Phosphorus Card */}
        <div className="soil-metric-card metric-p">
          <div className="metric-header">
            <span className="metric-name">Phosphorus (P)</span>
            <Sparkles size={16} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-val">{phosphorus !== undefined && phosphorus !== null ? phosphorus : "N/A"}</span>
            <span className="metric-sublabel">
              {analysis?.phosphorusStatus ? capitalize(analysis.phosphorusStatus) : "Root Growth"}
            </span>
          </div>
        </div>

        {/* Potassium Card */}
        <div className="soil-metric-card metric-k">
          <div className="metric-header">
            <span className="metric-name">Potassium (K)</span>
            <Droplets size={16} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-val">{potassium !== undefined && potassium !== null ? potassium : "N/A"}</span>
            <span className="metric-sublabel">
              {analysis?.potassiumStatus ? capitalize(analysis.potassiumStatus) : "Disease Resistance"}
            </span>
          </div>
        </div>

        {/* Organic Carbon Card */}
        <div className="soil-metric-card metric-oc">
          <div className="metric-header">
            <span className="metric-name">Organic Carbon</span>
            <FlaskConical size={16} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-val">{organicCarbon !== undefined && organicCarbon !== null ? `${organicCarbon}%` : "N/A"}</span>
            <span className="metric-sublabel">Soil Fertility %</span>
          </div>
        </div>
      </div>

      {/* Intelligence Insights Summary if available */}
      {intelligence?.deficiencies && intelligence.deficiencies.length > 0 && (
        <div className="soil-intelligence-alert">
          <div className="alert-icon-wrap">
            <AlertCircle size={18} color="#d97706" />
          </div>
          <div className="alert-text">
            <strong>Deficiency Alert:</strong>{" "}
            {intelligence.deficiencies.map((d) => `${d.nutrient}: ${d.message || d.status}`).join(" | ")}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilSummary;
