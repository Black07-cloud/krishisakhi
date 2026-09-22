import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";

const TASK_TYPES = [
  { value: "general", label: "📋 General Task" },
  { value: "irrigation", label: "💧 Irrigation" },
  { value: "fertilizer", label: "🧪 Fertilizer Application" },
  { value: "pest", label: "🐛 Pest Inspection / Control" },
  { value: "disease", label: "🦠 Disease Treatment" },
  { value: "harvest", label: "🌾 Harvest Preparation" },
  { value: "planting", label: "🌱 Planting / Sowing" },
  { value: "inspection", label: "🔍 Crop Inspection" },
  { value: "weather", label: "🌦️ Weather Action" },
  { value: "market", label: "📈 Market Planning" },
];

const TASK_PRIORITIES = [
  { value: "low", label: "🔵 Low" },
  { value: "normal", label: "🟢 Normal" },
  { value: "high", label: "🟠 High" },
  { value: "urgent", label: "🔴 Urgent" },
];

const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  farms = [],
  crops = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    farmId: "",
    cropId: "",
    title: "",
    description: "",
    type: "general",
    priority: "normal",
    dueDate: "",
    dueTime: "08:00",
    reason: "",
  });

  const [availableCrops, setAvailableCrops] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      const due = initialData.dueAt ? new Date(initialData.dueAt) : new Date();
      const yyyy = due.getFullYear();
      const mm = String(due.getMonth() + 1).padStart(2, "0");
      const dd = String(due.getDate()).padStart(2, "0");
      const hh = String(due.getHours()).padStart(2, "0");
      const min = String(due.getMinutes()).padStart(2, "0");

      setFormData({
        farmId: initialData.farm?._id || initialData.farm || "",
        cropId: initialData.crop?._id || initialData.crop || "",
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "general",
        priority: initialData.priority || "normal",
        dueDate: `${yyyy}-${mm}-${dd}`,
        dueTime: `${hh}:${min}`,
        reason: initialData.reason || "",
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");

      setFormData({
        farmId: farms.length > 0 ? farms[0]._id : "",
        cropId: "",
        title: "",
        description: "",
        type: "general",
        priority: "normal",
        dueDate: `${yyyy}-${mm}-${dd}`,
        dueTime: "08:00",
        reason: "",
      });
    }
    setError("");
  }, [initialData, isOpen, farms]);

  // Update available crops when farmId changes
  useEffect(() => {
    if (formData.farmId) {
      const filtered = crops.filter(
        (c) => (c.farm?._id || c.farm) === formData.farmId
      );
      setAvailableCrops(filtered);
    } else {
      setAvailableCrops([]);
    }
  }, [formData.farmId, crops]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "farmId" ? { cropId: "" } : {}), // Reset crop if farm changes
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.farmId) {
      setError("Please select a farm.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!formData.dueDate) {
      setError("Due date is required.");
      return;
    }

    const dueAtISO = new Date(`${formData.dueDate}T${formData.dueTime}:00`).toISOString();

    const payload = {
      farmId: formData.farmId,
      cropId: formData.cropId || null,
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      priority: formData.priority,
      dueAt: dueAtISO,
      reason: formData.reason.trim(),
      source: initialData ? initialData.source : "manual",
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? "✏️ Edit Farm Task" : "➕ Create New Farm Task"}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {error && (
            <div className="form-error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Select Farm *</label>
              <select
                name="farmId"
                value={formData.farmId}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Choose Farm --</option>
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    🏡 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Crop (Optional)</label>
              <select
                name="cropId"
                value={formData.cropId}
                onChange={handleChange}
                className="form-input"
                disabled={!formData.farmId}
              >
                <option value="">-- No specific crop (Whole Farm) --</option>
                {availableCrops.map((c) => (
                  <option key={c._id} value={c._id}>
                    🌱 {c.name} ({c.currentStage || "active"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Inspect tomato plants for pest activity"
              maxLength={200}
              className="form-input"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Task Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-input"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Time</label>
              <input
                type="time"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed instructions or context for this farm task..."
              maxLength={1000}
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Trigger Context</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Routine crop inspection / High moisture alert"
              maxLength={500}
              className="form-input"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Saving..."
                : initialData
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
