import { Sprout, CheckCircle2, Calendar, PackageCheck } from "lucide-react";

/**
 * Compute summary statistics from crops list
 */
const getCropSummaryStats = (crops = []) => {
  const totalCrops = crops.length;
  const activeCrops = crops.filter((c) => c.status === "active" || (!c.status && c.currentStage !== "harvest")).length;
  const harvestedCrops = crops.filter((c) => c.status === "harvested" || c.currentStage === "harvest").length;

  // Crops near harvest (expected harvest date within 30 days from now)
  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  const nearHarvestCount = crops.filter((c) => {
    if (c.status === "harvested" || c.status === "failed" || c.status === "cancelled") return false;
    if (!c.expectedHarvestDate) return false;
    const harvestDate = new Date(c.expectedHarvestDate);
    return harvestDate >= now && harvestDate <= thirtyDaysLater;
  }).length;

  return {
    totalCrops,
    activeCrops,
    nearHarvestCount,
    harvestedCrops,
  };
};

const CropSummary = ({ crops = [], loading = false }) => {
  const stats = getCropSummaryStats(crops);

  return (
    <div className="crops-summary-grid">
      <div className="crops-summary-card">
        <div className="crops-summary-icon icon-green">
          <Sprout size={22} />
        </div>
        <div className="crops-summary-info">
          <span className="crops-summary-label">Total Crops</span>
          <span className="crops-summary-value">{loading ? "..." : stats.totalCrops}</span>
        </div>
      </div>

      <div className="crops-summary-card">
        <div className="crops-summary-icon icon-blue">
          <CheckCircle2 size={22} />
        </div>
        <div className="crops-summary-info">
          <span className="crops-summary-label">Active Crops</span>
          <span className="crops-summary-value">{loading ? "..." : stats.activeCrops}</span>
        </div>
      </div>

      <div className="crops-summary-card">
        <div className="crops-summary-icon icon-amber">
          <Calendar size={22} />
        </div>
        <div className="crops-summary-info">
          <span className="crops-summary-label">Near Harvest (&lt;30 days)</span>
          <span className="crops-summary-value">{loading ? "..." : stats.nearHarvestCount}</span>
        </div>
      </div>

      <div className="crops-summary-card">
        <div className="crops-summary-icon icon-purple">
          <PackageCheck size={22} />
        </div>
        <div className="crops-summary-info">
          <span className="crops-summary-label">Harvested Crops</span>
          <span className="crops-summary-value">{loading ? "..." : stats.harvestedCrops}</span>
        </div>
      </div>
    </div>
  );
};

export default CropSummary;
