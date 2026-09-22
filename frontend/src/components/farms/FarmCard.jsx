import { MapPin, Sprout, Droplets, Eye, Edit, Trash2 } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "N/A");

const FarmCard = ({ farm, onView, onEdit, onDelete }) => {
  const { name, area, location, soilType, irrigationType, isActive } = farm;

  // Format location string
  const locParts = [location?.village, location?.district, location?.state].filter(Boolean);
  const locationStr = locParts.length > 0 ? locParts.join(", ") : "Location not specified";

  // Format area
  const areaVal = area?.value ?? "N/A";
  const areaUnit = area?.unit ? capitalize(area.unit) : "Acre";
  const areaDisplay = areaVal !== "N/A" ? `${areaVal} ${areaUnit}` : "Area unspecified";

  const isFarmActive = isActive !== false;

  return (
    <div className={`farm-card ${!isFarmActive ? "farm-card-inactive" : ""}`}>
      <div className="farm-card-header">
        <div className="farm-card-title-wrap">
          <div className="farm-card-icon">
            🌾
          </div>
          <h3 className="farm-card-name" title={name}>
            {name}
          </h3>
        </div>
        <span
          className={`status-badge ${isFarmActive ? "status-active" : "status-inactive"}`}
          title={isFarmActive ? "Farm is active" : "Farm is inactive"}
        >
          <span className="status-dot">●</span>
          {isFarmActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="farm-card-body">
        <div className="farm-card-area-badge">
          {areaDisplay}
        </div>

        <div className="farm-card-detail-item">
          <MapPin size={15} className="detail-icon icon-pin" />
          <span className="detail-text" title={locationStr}>
            {locationStr}
          </span>
        </div>

        <div className="farm-card-meta-grid">
          <div className="farm-card-detail-item">
            <Sprout size={15} className="detail-icon icon-sprout" />
            <span className="detail-text">
              {capitalize(soilType || "other")} Soil
            </span>
          </div>

          <div className="farm-card-detail-item">
            <Droplets size={15} className="detail-icon icon-droplet" />
            <span className="detail-text">
              {capitalize(irrigationType || "rainfed")}
            </span>
          </div>
        </div>
      </div>

      <div className="farm-card-actions">
        <button
          type="button"
          className="btn-card-action action-view"
          onClick={() => onView(farm)}
          aria-label={`View details for ${name}`}
        >
          <Eye size={15} />
          <span>View</span>
        </button>

        <button
          type="button"
          className="btn-card-action action-edit"
          onClick={() => onEdit(farm)}
          aria-label={`Edit ${name}`}
        >
          <Edit size={15} />
          <span>Edit</span>
        </button>

        <button
          type="button"
          className="btn-card-action action-delete"
          onClick={() => onDelete(farm)}
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={15} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default FarmCard;
