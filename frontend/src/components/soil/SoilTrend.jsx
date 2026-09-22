import { Activity } from "lucide-react";

const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const SoilTrend = ({ records = [] }) => {
  if (!records || records.length < 2) {
    return (
      <div className="soil-trend-card empty-trend">
        <div className="trend-icon-wrap">
          <Activity size={20} color="#94a3b8" />
        </div>
        <div className="trend-empty-info">
          <h4 className="trend-card-title">Soil Nutrient Trends</h4>
          <p className="trend-empty-text">
            More soil records are needed to display trends. Add at least two soil test records to track nutrient changes over time.
          </p>
        </div>
      </div>
    );
  }

  // Sort historical records chronologically (oldest to newest for trend timeline)
  const sortedHistory = records
    .slice()
    .sort((a, b) => new Date(a.testedAt || 0) - new Date(b.testedAt || 0))
    .slice(-5); // Take up to 5 latest tests

  // Find max values for relative bar heights
  const maxN = Math.max(...sortedHistory.map((r) => Number(r.nitrogen) || 0), 10);
  const maxP = Math.max(...sortedHistory.map((r) => Number(r.phosphorus) || 0), 10);
  const maxK = Math.max(...sortedHistory.map((r) => Number(r.potassium) || 0), 10);

  return (
    <div className="soil-trend-card">
      <div className="trend-card-header">
        <div className="trend-title-group">
          <Activity size={20} color="#16a34a" />
          <h3 className="trend-card-title">Historical Soil Nutrient Trends</h3>
        </div>
        <span className="trend-badge-count">
          Showing last {sortedHistory.length} tests
        </span>
      </div>

      <div className="trend-bars-container">
        <div className="trend-chart-legend">
          <span className="legend-item leg-n">● Nitrogen (N)</span>
          <span className="legend-item leg-p">● Phosphorus (P)</span>
          <span className="legend-item leg-k">● Potassium (K)</span>
          <span className="legend-item leg-ph">● pH</span>
        </div>

        <div className="trend-timeline-grid">
          {sortedHistory.map((rec) => {
            const nPct = Math.min(Math.round(((rec.nitrogen || 0) / maxN) * 100), 100);
            const pPct = Math.min(Math.round(((rec.phosphorus || 0) / maxP) * 100), 100);
            const kPct = Math.min(Math.round(((rec.potassium || 0) / maxK) * 100), 100);

            return (
              <div key={rec._id} className="trend-time-col">
                <div className="trend-bars-group">
                  {/* N Bar */}
                  <div className="bar-wrapper" title={`Nitrogen: ${rec.nitrogen ?? "N/A"}`}>
                    <div className="bar-fill bar-n" style={{ height: `${nPct}%` }} />
                  </div>
                  {/* P Bar */}
                  <div className="bar-wrapper" title={`Phosphorus: ${rec.phosphorus ?? "N/A"}`}>
                    <div className="bar-fill bar-p" style={{ height: `${pPct}%` }} />
                  </div>
                  {/* K Bar */}
                  <div className="bar-wrapper" title={`Potassium: ${rec.potassium ?? "N/A"}`}>
                    <div className="bar-fill bar-k" style={{ height: `${kPct}%` }} />
                  </div>
                </div>

                <div className="trend-col-footer">
                  <span className="trend-date-label">
                    {formatDateShort(rec.testedAt)}
                  </span>
                  {rec.ph !== undefined && rec.ph !== null && (
                    <span className="trend-ph-pill">pH {rec.ph}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SoilTrend;
