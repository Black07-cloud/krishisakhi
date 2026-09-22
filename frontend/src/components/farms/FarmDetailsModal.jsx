import { useEffect } from "react";
import { X, MapPin, Maximize2, Sprout, Droplets, Compass, Calendar, CheckCircle2 } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "N/A");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const FarmDetailsModal = ({ farm, onClose, onEdit }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!farm) return null;

  const {
    name,
    area,
    location,
    soilType,
    irrigationType,
    isActive,
    createdAt,
    updatedAt,
  } = farm;

  const lat = location?.coordinates?.latitude;
  const lng = location?.coordinates?.longitude;
  const hasCoords = lat !== undefined && lat !== null && lng !== undefined && lng !== null;

  const isFarmActive = isActive !== false;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-farm-details-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">🌾</span>
            <h2 id="modal-farm-details-title" className="modal-title">
              {name}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-status-bar">
            <span className={`status-badge ${isFarmActive ? "status-active" : "status-inactive"}`}>
              <CheckCircle2 size={14} />
              {isFarmActive ? "Active Farm" : "Inactive Farm"}
            </span>
            <span className="details-id-text">ID: {farm._id}</span>
          </div>

          <div className="details-grid">
            <div className="details-item">
              <div className="details-item-icon">
                <Maximize2 size={18} />
              </div>
              <div className="details-item-content">
                <span className="details-label">Cultivated Area</span>
                <span className="details-value">
                  {area?.value ?? "N/A"} {area?.unit ? capitalize(area.unit) : "Acre"}
                </span>
              </div>
            </div>

            <div className="details-item">
              <div className="details-item-icon icon-sprout">
                <Sprout size={18} />
              </div>
              <div className="details-item-content">
                <span className="details-label">Soil Type</span>
                <span className="details-value">{capitalize(soilType || "other")}</span>
              </div>
            </div>

            <div className="details-item">
              <div className="details-item-icon icon-droplet">
                <Droplets size={18} />
              </div>
              <div className="details-item-content">
                <span className="details-label">Irrigation System</span>
                <span className="details-value">{capitalize(irrigationType || "rainfed")}</span>
              </div>
            </div>

            <div className="details-item">
              <div className="details-item-icon icon-pin">
                <Compass size={18} />
              </div>
              <div className="details-item-content">
                <span className="details-label">Coordinates</span>
                <span className="details-value">
                  {hasCoords ? `${lat}°, ${lng}°` : "Not provided"}
                </span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4 className="details-section-title">
              <MapPin size={16} /> Location Details
            </h4>
            <div className="details-location-box">
              <div className="location-row">
                <span className="loc-label">State:</span>
                <span className="loc-val">{location?.state || "Not specified"}</span>
              </div>
              <div className="location-row">
                <span className="loc-label">District:</span>
                <span className="loc-val">{location?.district || "Not specified"}</span>
              </div>
              <div className="location-row">
                <span className="loc-label">Village:</span>
                <span className="loc-val">{location?.village || "Not specified"}</span>
              </div>
            </div>
          </div>

          <div className="details-dates-footer">
            <div className="date-info">
              <Calendar size={13} />
              <span>Created: {formatDate(createdAt)}</span>
            </div>
            {updatedAt && (
              <div className="date-info">
                <Calendar size={13} />
                <span>Updated: {formatDate(updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onEdit(farm);
              }}
            >
              Edit Farm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmDetailsModal;
