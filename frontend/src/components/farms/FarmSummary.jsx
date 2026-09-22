import { MapPin, CheckCircle2, Maximize2, Droplets } from "lucide-react";

/**
 * Helper to compute summary stats from real farm array
 */
const getSummaryStats = (farms = []) => {
  const totalFarms = farms.length;
  const activeFarms = farms.filter((f) => f.isActive !== false).length;

  // Aggregate cultivated area by unit (e.g. Acre, Hectare, Cent)
  const areaByUnit = {};
  farms.forEach((f) => {
    const val = Number(f.area?.value) || 0;
    const unit = f.area?.unit || "acre";
    areaByUnit[unit] = (areaByUnit[unit] || 0) + val;
  });

  let totalAreaText = "N/A";
  const units = Object.keys(areaByUnit);
  if (units.length > 0) {
    totalAreaText = units
      .map((u) => `${areaByUnit[u].toLocaleString(undefined, { maximumFractionDigits: 2 })} ${u}${areaByUnit[u] !== 1 ? "s" : ""}`)
      .join(", ");
  }

  // Find most frequent irrigation type
  const irrCounts = {};
  farms.forEach((f) => {
    if (f.irrigationType) {
      const type = f.irrigationType;
      irrCounts[type] = (irrCounts[type] || 0) + 1;
    }
  });

  let mainIrrigation = "N/A";
  let maxCount = 0;
  Object.entries(irrCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mainIrrigation = type;
    }
  });

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "N/A");

  return {
    totalFarms,
    activeFarms,
    totalAreaText,
    mainIrrigation: mainIrrigation !== "N/A" ? capitalize(mainIrrigation) : "N/A",
  };
};

const FarmSummary = ({ farms = [], loading = false }) => {
  const stats = getSummaryStats(farms);

  return (
    <div className="farms-summary-grid">
      <div className="farms-summary-card">
        <div className="farms-summary-icon icon-green">
          <MapPin size={22} />
        </div>
        <div className="farms-summary-info">
          <span className="farms-summary-label">Total Farms</span>
          <span className="farms-summary-value">{loading ? "..." : stats.totalFarms}</span>
        </div>
      </div>

      <div className="farms-summary-card">
        <div className="farms-summary-icon icon-blue">
          <CheckCircle2 size={22} />
        </div>
        <div className="farms-summary-info">
          <span className="farms-summary-label">Active Farms</span>
          <span className="farms-summary-value">{loading ? "..." : stats.activeFarms}</span>
        </div>
      </div>

      <div className="farms-summary-card">
        <div className="farms-summary-icon icon-amber">
          <Maximize2 size={22} />
        </div>
        <div className="farms-summary-info">
          <span className="farms-summary-label">Total Cultivated Area</span>
          <span className="farms-summary-value small-text">{loading ? "..." : stats.totalAreaText}</span>
        </div>
      </div>

      <div className="farms-summary-card">
        <div className="farms-summary-icon icon-cyan">
          <Droplets size={22} />
        </div>
        <div className="farms-summary-info">
          <span className="farms-summary-label">Main Irrigation Type</span>
          <span className="farms-summary-value">{loading ? "..." : stats.mainIrrigation}</span>
        </div>
      </div>
    </div>
  );
};

export default FarmSummary;
