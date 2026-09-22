import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { STAGE_ORDER } from "./CropLifecycle";

const AREA_UNITS = [
  { value: "acre", label: "Acre" },
  { value: "hectare", label: "Hectare" },
  { value: "cent", label: "Cent" },
];

const CropFormModal = ({
  crop = null,
  farms = [],
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const isEditing = Boolean(crop);

  const [formData, setFormData] = useState({
    farm: "",
    name: "",
    variety: "",
    areaValue: "",
    areaUnit: "acre",
    plantingDate: "",
    expectedHarvestDate: "",
    currentStage: "seed",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (crop) {
      const farmId = typeof crop.farm === "object" ? crop.farm?._id : crop.farm;
      const formatDateInput = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

      setFormData({
        farm: farmId || "",
        name: crop.name || "",
        variety: crop.variety || "",
        areaValue: crop.area?.value ?? "",
        areaUnit: crop.area?.unit || "acre",
        plantingDate: formatDateInput(crop.plantingDate),
        expectedHarvestDate: formatDateInput(crop.expectedHarvestDate),
        currentStage: crop.currentStage || "seed",
      });
    } else if (farms.length > 0) {
      setFormData((prev) => ({ ...prev, farm: farms[0]._id }));
    }
  }, [crop, farms]);

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Farm validation
    if (!formData.farm) {
      newErrors.farm = "Please select a farm.";
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Crop name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Crop name must be at least 2 characters.";
    }

    // Area validation
    if (formData.areaValue === "" || formData.areaValue === null || formData.areaValue === undefined) {
      newErrors.areaValue = "Area value is required.";
    } else {
      const num = parseFloat(formData.areaValue);
      if (isNaN(num) || num <= 0) {
        newErrors.areaValue = "Area must be greater than 0.";
      }
    }

    // Planting date validation
    if (!formData.plantingDate) {
      newErrors.plantingDate = "Planting date is required.";
    }

    // Expected harvest date validation
    if (formData.plantingDate && formData.expectedHarvestDate) {
      const pDate = new Date(formData.plantingDate);
      const hDate = new Date(formData.expectedHarvestDate);
      if (hDate <= pDate) {
        newErrors.expectedHarvestDate = "Expected harvest date must be after planting date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      farm: formData.farm,
      name: formData.name.trim(),
      variety: formData.variety.trim() || undefined,
      area: {
        value: parseFloat(formData.areaValue),
        unit: formData.areaUnit,
      },
      plantingDate: formData.plantingDate,
      expectedHarvestDate: formData.expectedHarvestDate || undefined,
      currentStage: formData.currentStage,
    };

    onSubmit(payload);
  };

  const hasNoFarms = farms.length === 0;

  return (
    <div className="modal-backdrop" onClick={() => !submitting && onClose()}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="crop-form-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">🌱</span>
            <h2 id="crop-form-title" className="modal-title">
              {isEditing ? "Edit Crop" : "Add New Crop"}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {hasNoFarms && !isEditing ? (
          <div className="modal-body">
            <div className="no-farms-warning">
              <AlertCircle size={36} color="#d97706" />
              <h3>No Farms Available</h3>
              <p>
                You must add at least one farm before creating crops.
              </p>
              <Link to="/farms" className="btn btn-primary">
                <PlusCircle size={16} /> Go to My Farms
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body form-body">
              <div className="form-section">
                <h4 className="form-section-title">Farm & Crop Identity</h4>

                <div className="form-group">
                  <label htmlFor="crop-farm" className="form-label">
                    Select Farm <span className="required-star">*</span>
                  </label>
                  <select
                    id="crop-farm"
                    name="farm"
                    className={`form-select ${errors.farm ? "input-error" : ""}`}
                    value={formData.farm}
                    onChange={handleChange}
                    disabled={submitting || isEditing}
                  >
                    <option value="">-- Choose Farm --</option>
                    {farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.location?.district || f.location?.state || "Farm"})
                      </option>
                    ))}
                  </select>
                  {errors.farm && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.farm}
                    </span>
                  )}
                </div>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="crop-name" className="form-label">
                      Crop Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="crop-name"
                      type="text"
                      name="name"
                      className={`form-input ${errors.name ? "input-error" : ""}`}
                      placeholder="e.g. Tomato, Rice, Wheat"
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

                  <div className="form-group">
                    <label htmlFor="crop-variety" className="form-label">
                      Variety / Strain <span className="sublabel">(Optional)</span>
                    </label>
                    <input
                      id="crop-variety"
                      type="text"
                      name="variety"
                      className="form-input"
                      placeholder="e.g. PKM-1, Basmati, Sonalika"
                      value={formData.variety}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Area & Growth Stage</h4>

                <div className="form-row three-col">
                  <div className="form-group">
                    <label htmlFor="crop-area-value" className="form-label">
                      Cultivated Area <span className="required-star">*</span>
                    </label>
                    <input
                      id="crop-area-value"
                      type="number"
                      step="any"
                      name="areaValue"
                      className={`form-input ${errors.areaValue ? "input-error" : ""}`}
                      placeholder="e.g. 2"
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
                    <label htmlFor="crop-area-unit" className="form-label">
                      Unit <span className="required-star">*</span>
                    </label>
                    <select
                      id="crop-area-unit"
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

                  <div className="form-group">
                    <label htmlFor="crop-stage" className="form-label">
                      Current Stage
                    </label>
                    <select
                      id="crop-stage"
                      name="currentStage"
                      className="form-select"
                      value={formData.currentStage}
                      onChange={handleChange}
                      disabled={submitting || isEditing}
                    >
                      {STAGE_ORDER.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Timeline & Schedule</h4>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="crop-planting-date" className="form-label">
                      Planting Date <span className="required-star">*</span>
                    </label>
                    <input
                      id="crop-planting-date"
                      type="date"
                      name="plantingDate"
                      className={`form-input ${errors.plantingDate ? "input-error" : ""}`}
                      value={formData.plantingDate}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.plantingDate && (
                      <span className="error-message">
                        <AlertCircle size={12} /> {errors.plantingDate}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="crop-harvest-date" className="form-label">
                      Expected Harvest Date <span className="sublabel">(Optional)</span>
                    </label>
                    <input
                      id="crop-harvest-date"
                      type="date"
                      name="expectedHarvestDate"
                      className={`form-input ${errors.expectedHarvestDate ? "input-error" : ""}`}
                      value={formData.expectedHarvestDate}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.expectedHarvestDate && (
                      <span className="error-message">
                        <AlertCircle size={12} /> {errors.expectedHarvestDate}
                      </span>
                    )}
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
                    <span>{isEditing ? "Save Changes" : "Create Crop"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CropFormModal;
