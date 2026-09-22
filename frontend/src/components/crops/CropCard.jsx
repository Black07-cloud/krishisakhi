import { MapPin, Calendar, Sprout, Eye, Edit, Trash2 } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const STAGE_BADGE_CLASSES = {
  seed: "stage-badge-seed",
  germination: "stage-badge-germination",
  vegetative: "stage-badge-vegetative",
  flowering: "stage-badge-flowering",
  fruiting: "stage-badge-fruiting",
  maturity: "stage-badge-maturity",
  harvest: "stage-badge-harvest",
};

const STATUS_BADGE_CLASSES = {
  active: "status-badge-active",
  harvested: "status-badge-harvested",
  failed: "status-badge-failed",
  cancelled: "status-badge-cancelled",
};

const CropCard = ({ crop, onView, onEdit, onDelete }) => {
  const {
    name,
    variety,
    farm,
    area,
    plantingDate,
    expectedHarvestDate,
    currentStage,
    status = "active",
  } = crop;

  const farmName = typeof farm === "object" ? farm?.name : "Associated Farm";
  const areaVal = area?.value ?? "N/A";
  const areaUnit = area?.unit ? capitalize(area.unit) : "Acre";

  const stageClass = STAGE_BADGE_CLASSES[currentStage] || "stage-badge-default";
  const statusClass = STATUS_BADGE_CLASSES[status] || "status-badge-active";

  return (
    <div className="crop-card">
      <div className="crop-card-header">
        <div className="crop-card-title-group">
          <div className="crop-card-icon">🌱</div>
          <div>
            <h3 className="crop-card-name" title={name}>
              {name}
            </h3>
            {variety && <span className="crop-card-variety">{variety}</span>}
          </div>
        </div>
        <span className={`crop-status-badge ${statusClass}`}>
          ● {capitalize(status)}
        </span>
      </div>

      <div className="crop-card-body">
        <div className="crop-card-meta-row">
          <div className="crop-farm-tag">
            <MapPin size={13} />
            <span className="farm-name-text">{farmName}</span>
          </div>
          <span className="crop-area-pill">
            {areaVal} {areaUnit}
          </span>
        </div>

        <div className="crop-stage-row">
          <span className="stage-label-title">Current Stage:</span>
          <span className={`crop-stage-badge ${stageClass}`}>
            <Sprout size={13} />
            {capitalize(currentStage || "seed")}
          </span>
        </div>

        <div className="crop-dates-grid">
          <div className="crop-date-item">
            <span className="date-label">Planted:</span>
            <span className="date-value">
              <Calendar size={13} /> {formatDate(plantingDate)}
            </span>
          </div>
          <div className="crop-date-item">
            <span className="date-label">Expected Harvest:</span>
            <span className="date-value">
              <Calendar size={13} /> {formatDate(expectedHarvestDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="crop-card-actions">
        <button
          type="button"
          className="btn-card-action action-view"
          onClick={() => onView(crop)}
          aria-label={`View details for ${name}`}
        >
          <Eye size={15} />
          <span>View</span>
        </button>

        <button
          type="button"
          className="btn-card-action action-edit"
          onClick={() => onEdit(crop)}
          aria-label={`Edit ${name}`}
        >
          <Edit size={15} />
          <span>Edit</span>
        </button>

        <button
          type="button"
          className="btn-card-action action-delete"
          onClick={() => onDelete(crop)}
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={15} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default CropCard;
