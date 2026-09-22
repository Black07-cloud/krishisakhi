import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { capitalize } from "./dashboardUtils";

const FarmRow = ({ farmDashboard }) => {
  const { farm, crop, tasks } = farmDashboard;

  const location = [farm.location?.village, farm.location?.district, farm.location?.state]
    .filter(Boolean)
    .join(", ") || "Location not set";

  const areaStr = farm.area?.value
    ? `${farm.area.value} ${farm.area.unit || "acre"}`
    : null;

  return (
    <Link to="/farms" className="farm-card-row">
      <div className="farm-avatar">
        <MapPin size={20} color="#16a34a" />
      </div>

      <div className="farm-card-info">
        <div className="farm-card-name">{farm.name}</div>
        <div className="farm-card-meta">
          {areaStr && <span>{areaStr}</span>}
          {areaStr && <span className="farm-meta-dot" />}
          <span>{location}</span>
          {farm.soilType && farm.soilType !== "other" && (
            <>
              <span className="farm-meta-dot" />
              <span>{capitalize(farm.soilType)} soil</span>
            </>
          )}
        </div>
      </div>

      <div className="farm-card-right">
        {crop && (
          <span className="badge badge-green">{capitalize(crop.currentStage)}</span>
        )}
        {tasks?.pendingCount > 0 && (
          <span className="badge badge-amber">{tasks.pendingCount} task{tasks.pendingCount !== 1 ? "s" : ""}</span>
        )}
        <ArrowRight size={14} color="var(--text-muted)" />
      </div>
    </Link>
  );
};

export default FarmRow;
