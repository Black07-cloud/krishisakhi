import React from "react";
import { Search, Filter, RotateCcw, Calendar, ShieldAlert } from "lucide-react";

const TASK_TYPES = [
  { value: "", label: "All Types" },
  { value: "irrigation", label: "💧 Irrigation" },
  { value: "fertilizer", label: "🧪 Fertilizer" },
  { value: "pest", label: "🐛 Pest Control" },
  { value: "disease", label: "🦠 Disease Alert" },
  { value: "harvest", label: "🌾 Harvest" },
  { value: "planting", label: "🌱 Planting" },
  { value: "inspection", label: "🔍 Inspection" },
  { value: "weather", label: "🌦️ Weather" },
  { value: "market", label: "📈 Market" },
  { value: "general", label: "📋 General" },
];

const TASK_PRIORITIES = [
  { value: "", label: "All Priorities" },
  { value: "low", label: "🔵 Low" },
  { value: "normal", label: "🟢 Normal" },
  { value: "high", label: "🟠 High" },
  { value: "urgent", label: "🔴 Urgent" },
];

const TASK_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TASK_SOURCES = [
  { value: "", label: "All Sources" },
  { value: "manual", label: "👤 Manual" },
  { value: "automation", label: "⚡ Farmio Automation" },
  { value: "ai", label: "🤖 Farmio AI" },
];

const TaskFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  farms = [],
  crops = [],
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const hasActiveFilters = Object.values(filters).some((val) => Boolean(val));

  return (
    <div className="task-filters-card">
      <div className="filters-top-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleChange}
            placeholder="Search task title, description..."
            className="filter-search-input"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-secondary btn-reset-filters"
            onClick={onResetFilters}
          >
            <RotateCcw className="btn-icon" /> Reset Filters
          </button>
        )}
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label className="filter-label">Farm</label>
          <select
            name="farmId"
            value={filters.farmId || ""}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Farms</option>
            {farms.map((f) => (
              <option key={f._id} value={f._id}>
                🏡 {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Crop</label>
          <select
            name="cropId"
            value={filters.cropId || ""}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Crops</option>
            {crops.map((c) => (
              <option key={c._id} value={c._id}>
                🌱 {c.name} ({c.farm?.name || "Farm"})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            name="status"
            value={filters.status || ""}
            onChange={handleChange}
            className="filter-select"
          >
            {TASK_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Priority</label>
          <select
            name="priority"
            value={filters.priority || ""}
            onChange={handleChange}
            className="filter-select"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Type</label>
          <select
            name="type"
            value={filters.type || ""}
            onChange={handleChange}
            className="filter-select"
          >
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Source</label>
          <select
            name="source"
            value={filters.source || ""}
            onChange={handleChange}
            className="filter-select"
          >
            {TASK_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
