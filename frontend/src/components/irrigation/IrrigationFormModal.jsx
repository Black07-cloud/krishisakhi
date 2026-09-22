import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent" },
  { value: "low", label: "Low Priority" },
];

const IrrigationFormModal = ({
  farms = [],
  crops = [],
  selectedFarmId = "",
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const [formData, setFormData] = useState({
    farm: selectedFarmId || (farms.length > 0 ? farms[0]._id : ""),
    crop: "",
    title: "",
    priority: "normal",
    dueAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // Default +1 hr
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedFarmId) {
      setFormData((prev) => ({ ...prev, farm: selectedFarmId }));
    }
  }, [selectedFarmId]);

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
      newErrors.farm = "Please select a farm.";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Schedule title is required.";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters.";
    }

    if (!formData.dueAt) {
      newErrors.dueAt = "Scheduled date & time is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build task payload for createTask API
    const payload = {
      farm: formData.farm,
      title: formData.title.trim(),
      type: "irrigation",
      priority: formData.priority,
      reason: formData.reason.trim() || undefined,
      dueAt: formData.dueAt ? new Date(formData.dueAt) : undefined,
      source: "manual",
    };

    onSubmit(payload);
  };

  const hasNoFarms = farms.length === 0;

  return (
    <div className="modal-backdrop" onClick={() => !submitting && onClose()}>
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="irrigation-form-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">💧</span>
            <h2 id="irrigation-form-title" className="modal-title">
              Schedule Irrigation
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

        {hasNoFarms ? (
          <div className="modal-body">
            <div className="no-farms-warning">
              <AlertCircle size={36} color="#d97706" />
              <h3>No Farms Available</h3>
              <p>You must add a farm before scheduling irrigation tasks.</p>
              <Link to="/farms" className="btn btn-primary">
                <PlusCircle size={16} /> Go to My Farms
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body form-body">
              <div className="form-section">
                <h4 className="form-section-title">Schedule Information</h4>

                <div className="form-group">
                  <label htmlFor="irr-farm" className="form-label">
                    Select Farm <span className="required-star">*</span>
                  </label>
                  <select
                    id="irr-farm"
                    name="farm"
                    className={`form-select ${errors.farm ? "input-error" : ""}`}
                    value={formData.farm}
                    onChange={handleChange}
                    disabled={submitting}
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

                {crops.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="irr-crop" className="form-label">
                      Select Crop <span className="sublabel">(Optional)</span>
                    </label>
                    <select
                      id="irr-crop"
                      name="crop"
                      className="form-select"
                      value={formData.crop}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">-- All / General Farm Crop --</option>
                      {crops.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.variety ? `(${c.variety})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="irr-title" className="form-label">
                    Schedule Title / Task Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="irr-title"
                    type="text"
                    name="title"
                    className={`form-input ${errors.title ? "input-error" : ""}`}
                    placeholder="e.g. Drip Irrigation - Morning Cycle"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.title && (
                    <span className="error-message">
                      <AlertCircle size={12} /> {errors.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Schedule Timing & Priority</h4>

                <div className="form-row two-col">
                  <div className="form-group">
                    <label htmlFor="irr-due-at" className="form-label">
                      Scheduled Date & Time <span className="required-star">*</span>
                    </label>
                    <input
                      id="irr-due-at"
                      type="datetime-local"
                      name="dueAt"
                      className={`form-input ${errors.dueAt ? "input-error" : ""}`}
                      value={formData.dueAt}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.dueAt && (
                      <span className="error-message">
                        <AlertCircle size={12} /> {errors.dueAt}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="irr-priority" className="form-label">
                      Priority Level
                    </label>
                    <select
                      id="irr-priority"
                      name="priority"
                      className="form-select"
                      value={formData.priority}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="irr-reason" className="form-label">
                    Reason / Instructions <span className="sublabel">(Optional)</span>
                  </label>
                  <textarea
                    id="irr-reason"
                    name="reason"
                    rows={3}
                    className="form-input"
                    placeholder="e.g. Run drip lines for 45 minutes; apply low pressure due to high temperature forecast"
                    value={formData.reason}
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
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Schedule Task</span>
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

export default IrrigationFormModal;
