import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Loader2 } from "lucide-react";

const SOIL_TYPES = [
  { value: "clay", label: "Clay" },
  { value: "sandy", label: "Sandy" },
  { value: "loamy", label: "Loamy" },
  { value: "silty", label: "Silty" },
  { value: "black", label: "Black" },
  { value: "red", label: "Red" },
  { value: "alluvial", label: "Alluvial" },
  { value: "other", label: "Other" },
];

const IRRIGATION_TYPES = [
  { value: "rainfed", label: "Rainfed" },
  { value: "drip", label: "Drip Irrigation" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "canal", label: "Canal" },
  { value: "borewell", label: "Borewell" },
  { value: "other", label: "Other" },
];

const AREA_UNITS = [
  { value: "acre", label: "Acre" },
  { value: "hectare", label: "Hectare" },
  { value: "cent", label: "Cent" },
];

const FarmFormModal = ({ farm = null, onClose, onSubmit, submitting = false }) => {
  const isEditing = Boolean(farm);

  const [formData, setFormData] = useState({
    name: "",
    areaValue: "",
    areaUnit: "acre",
    state: "",
    district: "",
    village: "",
    latitude: "",
    longitude: "",
    soilType: "loamy",
    irrigationType: "drip",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || "",
        areaValue: farm.area?.value ?? "",
        areaUnit: farm.area?.unit || "acre",
        state: farm.location?.state || "",
        district: farm.location?.district || "",
        village: farm.location?.village || "",
        latitude: farm.location?.coordinates?.latitude ?? "",
        longitude: farm.location?.coordinates?.longitude ?? "",
        soilType: farm.soilType || "other",
        irrigationType: farm.irrigationType || "rainfed",
      });
    }
  }, [farm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Farm name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Farm name must be at least 2 characters.";
    }

    // Area validation
    if (formData.areaValue === "" || formData.areaValue === null || formData.areaValue === undefined) {
      newErrors.areaValue = "Area value is required.";
    } else {
      const areaNum = parseFloat(formData.areaValue);
      if (isNaN(areaNum) || areaNum <= 0) {
        newErrors.areaValue = "Area must be a number greater than 0.";
      }
    }

    // Latitude validation (optional)
    if (formData.latitude !== "" && formData.latitude !== null && formData.latitude !== undefined) {
      const latNum = parseFloat(formData.latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.latitude = "Latitude must be a number between -90 and 90.";
      }
    }

    // Longitude validation (optional)
    if (formData.longitude !== "" && formData.longitude !== null && formData.longitude !== undefined) {
      const lngNum = parseFloat(formData.longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.longitude = "Longitude must be a number between -180 and 180.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Construct backend payload
    const payload = {
      name: formData.name.trim(),
      area: {
        value: parseFloat(formData.areaValue),
        unit: formData.areaUnit,
      },
      location: {
        state: formData.state.trim(),
        district: formData.district.trim(),
        village: formData.village.trim(),
      },
      soilType: formData.soilType,
      irrigationType: formData.irrigationType,
    };

    // Add coordinates if provided
    const latStr = String(formData.latitude).trim();
    const lngStr = String(formData.longitude).trim();
    if (latStr !== "" && lngStr !== "") {
      payload.location.coordinates = {
        latitude: parseFloat(latStr),
        longitude: parseFloat(lngStr),
      };
    }

    onSubmit(payload);
  };

  return (
    <div className="modal-backdrop" onClick={() => !submitting && onClose()}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="farm-form-modal-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">🌾</span>
            <h2 id="farm-form-modal-title" className="modal-title">
              {isEditing ? "Edit Farm" : "Add New Farm"}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body form-body">
            {/* Basic Info Section */}
            <div className="form-section">
              <h4 className="form-section-title">Farm Information</h4>

              <div className="form-group">
                <label htmlFor="farm-name" className="form-label">
                  Farm Name <span className="required-star">*</span>
                </label>
                <input
                  id="farm-name"
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? "input-error" : ""}`}
                  placeholder="e.g. Green Valley Farm"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.name && (
                  <span className="error-message">
                    <AlertCircle size={12} /> {errors.name}
                  </span>
                )}
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="farm-area-value" className="form-label">
                    Area Value <span className="required-star">*</span>
                  </label>
                  <input
                    id="farm-area-value"
                    type="number"
                    step="any"
                    name="areaValue"
                    className={`form-input ${errors.areaValue ? "input-error" : ""}`}
                    placeholder="e.g. 2.5"
                    value={formData.areaValue}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.areaValue && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.areaValue}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="farm-area-unit" className="form-label">
                    Area Unit <span className="required-star">*</span>
                  </label>
                  <select
                    id="farm-area-unit"
                    name="areaUnit"
                    className="form-select"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {AREA_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="form-section">
              <h4 className="form-section-title">Location</h4>

              <div className="form-row three-col">
                <div className="form-group">
                  <label htmlFor="farm-state" className="form-label">State</label>
                  <input
                    id="farm-state"
                    type="text"
                    name="state"
                    className="form-input"
                    placeholder="e.g. Tamil Nadu"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="farm-district" className="form-label">District</label>
                  <input
                    id="farm-district"
                    type="text"
                    name="district"
                    className="form-input"
                    placeholder="e.g. Chennai"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="farm-village" className="form-label">Village / Town</label>
                  <input
                    id="farm-village"
                    type="text"
                    name="village"
                    className="form-input"
                    placeholder="e.g. Velachery"
                    value={formData.village}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="farm-latitude" className="form-label">
                    Latitude <span className="sublabel">(Optional, -90 to 90)</span>
                  </label>
                  <input
                    id="farm-latitude"
                    type="number"
                    step="any"
                    name="latitude"
                    className={`form-input ${errors.latitude ? "input-error" : ""}`}
                    placeholder="e.g. 12.9815"
                    value={formData.latitude}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.latitude && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.latitude}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="farm-longitude" className="form-label">
                    Longitude <span className="sublabel">(Optional, -180 to 180)</span>
                  </label>
                  <input
                    id="farm-longitude"
                    type="number"
                    step="any"
                    name="longitude"
                    className={`form-input ${errors.longitude ? "input-error" : ""}`}
                    placeholder="e.g. 80.2180"
                    value={formData.longitude}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.longitude && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.longitude}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Soil & Irrigation Section */}
            <div className="form-section">
              <h4 className="form-section-title">Soil & Irrigation</h4>

              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="farm-soil-type" className="form-label">Soil Type</label>
                  <select
                    id="farm-soil-type"
                    name="soilType"
                    className="form-select"
                    value={formData.soilType}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="farm-irrigation-type" className="form-label">Irrigation Type</label>
                  <select
                    id="farm-irrigation-type"
                    name="irrigationType"
                    className="form-select"
                    value={formData.irrigationType}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {IRRIGATION_TYPES.map((it) => (
                      <option key={it.value} value={it.value}>
                        {it.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>{isEditing ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? "Save Changes" : "Create Farm"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmFormModal;
