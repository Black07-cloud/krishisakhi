import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Loader2 } from "lucide-react";

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual Entry" },
  { value: "lab", label: "Lab Test Report" },
  { value: "sensor", label: "IoT Soil Sensor" },
  { value: "ai", label: "AI Estimated" },
];

const SoilFormModal = ({
  record = null,
  farms = [],
  selectedFarmId = "",
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const isEditing = Boolean(record);

  const [formData, setFormData] = useState({
    farm: selectedFarmId || (farms.length > 0 ? farms[0]._id : ""),
    testedAt: new Date().toISOString().split("T")[0],
    ph: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    organicCarbon: "",
    zinc: "",
    iron: "",
    manganese: "",
    copper: "",
    boron: "",
    source: "manual",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      const farmId = typeof record.farm === "object" ? record.farm?._id : record.farm;
      const testedDateStr = record.testedAt
        ? new Date(record.testedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormData({
        farm: farmId || selectedFarmId || "",
        testedAt: testedDateStr,
        ph: record.ph ?? "",
        nitrogen: record.nitrogen ?? "",
        phosphorus: record.phosphorus ?? "",
        potassium: record.potassium ?? "",
        organicCarbon: record.organicCarbon ?? "",
        zinc: record.micronutrients?.zinc ?? "",
        iron: record.micronutrients?.iron ?? "",
        manganese: record.micronutrients?.manganese ?? "",
        copper: record.micronutrients?.copper ?? "",
        boron: record.micronutrients?.boron ?? "",
        source: record.source || "manual",
        notes: record.notes || "",
      });
    } else if (selectedFarmId) {
      setFormData((prev) => ({ ...prev, farm: selectedFarmId }));
    }
  }, [record, selectedFarmId]);

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

    if (!formData.farm) {
      newErrors.farm = "Farm selection is required.";
    }

    // pH validation (0 - 14)
    if (formData.ph !== "" && formData.ph !== null && formData.ph !== undefined) {
      const phVal = parseFloat(formData.ph);
      if (isNaN(phVal) || phVal < 0 || phVal > 14) {
        newErrors.ph = "pH must be a number between 0 and 14.";
      }
    }

    // Nitrogen >= 0
    if (formData.nitrogen !== "" && formData.nitrogen !== null) {
      const nVal = parseFloat(formData.nitrogen);
      if (isNaN(nVal) || nVal < 0) {
        newErrors.nitrogen = "Nitrogen must be a non-negative number.";
      }
    }

    // Phosphorus >= 0
    if (formData.phosphorus !== "" && formData.phosphorus !== null) {
      const pVal = parseFloat(formData.phosphorus);
      if (isNaN(pVal) || pVal < 0) {
        newErrors.phosphorus = "Phosphorus must be a non-negative number.";
      }
    }

    // Potassium >= 0
    if (formData.potassium !== "" && formData.potassium !== null) {
      const kVal = parseFloat(formData.potassium);
      if (isNaN(kVal) || kVal < 0) {
        newErrors.potassium = "Potassium must be a non-negative number.";
      }
    }

    // Organic Carbon >= 0
    if (formData.organicCarbon !== "" && formData.organicCarbon !== null) {
      const ocVal = parseFloat(formData.organicCarbon);
      if (isNaN(ocVal) || ocVal < 0) {
        newErrors.organicCarbon = "Organic Carbon must be a non-negative number.";
      }
    }

    // Micronutrients check
    ["zinc", "iron", "manganese", "copper", "boron"].forEach((micro) => {
      if (formData[micro] !== "" && formData[micro] !== null) {
        const val = parseFloat(formData[micro]);
        if (isNaN(val) || val < 0) {
          newErrors[micro] = `${micro.charAt(0).toUpperCase() + micro.slice(1)} must be a non-negative number.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const parseNum = (val) => (val !== "" && val !== null && val !== undefined ? parseFloat(val) : undefined);

    const micronutrients = {
      zinc: parseNum(formData.zinc),
      iron: parseNum(formData.iron),
      manganese: parseNum(formData.manganese),
      copper: parseNum(formData.copper),
      boron: parseNum(formData.boron),
    };

    const hasMicros = Object.values(micronutrients).some((v) => v !== undefined);

    const payload = {
      farm: formData.farm,
      testedAt: formData.testedAt ? new Date(formData.testedAt) : undefined,
      ph: parseNum(formData.ph),
      nitrogen: parseNum(formData.nitrogen),
      phosphorus: parseNum(formData.phosphorus),
      potassium: parseNum(formData.potassium),
      organicCarbon: parseNum(formData.organicCarbon),
      micronutrients: hasMicros ? micronutrients : undefined,
      source: formData.source,
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-backdrop" onClick={() => !submitting && onClose()}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="soil-form-modal-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">🧪</span>
            <h2 id="soil-form-modal-title" className="modal-title">
              {isEditing ? "Edit Soil Record" : "Add Soil Test Record"}
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body form-body">
            {/* Record Information */}
            <div className="form-section">
              <h4 className="form-section-title">Test & Farm Details</h4>

              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="soil-farm" className="form-label">
                    Select Farm <span className="required-star">*</span>
                  </label>
                  <select
                    id="soil-farm"
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

                <div className="form-group">
                  <label htmlFor="soil-test-date" className="form-label">
                    Test Date
                  </label>
                  <input
                    id="soil-test-date"
                    type="date"
                    name="testedAt"
                    className="form-input"
                    value={formData.testedAt}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="soil-source" className="form-label">
                  Data Source
                </label>
                <select
                  id="soil-source"
                  name="source"
                  className="form-select"
                  value={formData.source}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  {SOURCE_OPTIONS.map((src) => (
                    <option key={src.value} value={src.value}>
                      {src.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Soil Parameters */}
            <div className="form-section">
              <h4 className="form-section-title">Primary Soil Parameters (NPK & pH)</h4>

              <div className="form-row three-col">
                <div className="form-group">
                  <label htmlFor="soil-ph" className="form-label">
                    pH Level <span className="sublabel">(0 - 14)</span>
                  </label>
                  <input
                    id="soil-ph"
                    type="number"
                    step="0.1"
                    name="ph"
                    className={`form-input ${errors.ph ? "input-error" : ""}`}
                    placeholder="e.g. 6.5"
                    value={formData.ph}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.ph && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.ph}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="soil-nitrogen" className="form-label">
                    Nitrogen (N)
                  </label>
                  <input
                    id="soil-nitrogen"
                    type="number"
                    step="any"
                    name="nitrogen"
                    className={`form-input ${errors.nitrogen ? "input-error" : ""}`}
                    placeholder="e.g. 250"
                    value={formData.nitrogen}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.nitrogen && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.nitrogen}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="soil-phosphorus" className="form-label">
                    Phosphorus (P)
                  </label>
                  <input
                    id="soil-phosphorus"
                    type="number"
                    step="any"
                    name="phosphorus"
                    className={`form-input ${errors.phosphorus ? "input-error" : ""}`}
                    placeholder="e.g. 18"
                    value={formData.phosphorus}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.phosphorus && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.phosphorus}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="soil-potassium" className="form-label">
                    Potassium (K)
                  </label>
                  <input
                    id="soil-potassium"
                    type="number"
                    step="any"
                    name="potassium"
                    className={`form-input ${errors.potassium ? "input-error" : ""}`}
                    placeholder="e.g. 140"
                    value={formData.potassium}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.potassium && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.potassium}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="soil-organic-carbon" className="form-label">
                    Organic Carbon <span className="sublabel">(%)</span>
                  </label>
                  <input
                    id="soil-organic-carbon"
                    type="number"
                    step="0.01"
                    name="organicCarbon"
                    className={`form-input ${errors.organicCarbon ? "input-error" : ""}`}
                    placeholder="e.g. 0.55"
                    value={formData.organicCarbon}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.organicCarbon && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.organicCarbon}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="form-section">
              <h4 className="form-section-title">Micronutrients <span className="sublabel">(Optional)</span></h4>

              <div className="form-row three-col">
                <div className="form-group">
                  <label htmlFor="soil-zinc" className="form-label">Zinc (Zn)</label>
                  <input
                    id="soil-zinc"
                    type="number"
                    step="any"
                    name="zinc"
                    className="form-input"
                    placeholder="e.g. 0.6"
                    value={formData.zinc}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="soil-iron" className="form-label">Iron (Fe)</label>
                  <input
                    id="soil-iron"
                    type="number"
                    step="any"
                    name="iron"
                    className="form-input"
                    placeholder="e.g. 4.5"
                    value={formData.iron}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="soil-manganese" className="form-label">Manganese (Mn)</label>
                  <input
                    id="soil-manganese"
                    type="number"
                    step="any"
                    name="manganese"
                    className="form-input"
                    placeholder="e.g. 2.0"
                    value={formData.manganese}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="soil-copper" className="form-label">Copper (Cu)</label>
                  <input
                    id="soil-copper"
                    type="number"
                    step="any"
                    name="copper"
                    className="form-input"
                    placeholder="e.g. 0.2"
                    value={formData.copper}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="soil-boron" className="form-label">Boron (B)</label>
                  <input
                    id="soil-boron"
                    type="number"
                    step="any"
                    name="boron"
                    className="form-input"
                    placeholder="e.g. 0.5"
                    value={formData.boron}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="soil-notes" className="form-label">
                  Notes / Observations <span className="sublabel">(Optional)</span>
                </label>
                <textarea
                  id="soil-notes"
                  name="notes"
                  rows={3}
                  className="form-input"
                  placeholder="e.g. Soil sample collected after heavy rainfall, tested at district lab"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={submitting}
                />
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
                  <span>{isEditing ? "Updating..." : "Saving Record..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? "Save Changes" : "Create Record"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoilFormModal;
