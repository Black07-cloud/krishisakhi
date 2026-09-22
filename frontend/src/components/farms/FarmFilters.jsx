import { Search, Filter, RotateCcw } from "lucide-react";

const SOIL_OPTIONS = [
  { value: "all", label: "All Soil Types" },
  { value: "clay", label: "Clay" },
  { value: "sandy", label: "Sandy" },
  { value: "loamy", label: "Loamy" },
  { value: "silty", label: "Silty" },
  { value: "black", label: "Black" },
  { value: "red", label: "Red" },
  { value: "alluvial", label: "Alluvial" },
  { value: "other", label: "Other" },
];

const IRRIGATION_OPTIONS = [
  { value: "all", label: "All Irrigation Types" },
  { value: "rainfed", label: "Rainfed" },
  { value: "drip", label: "Drip Irrigation" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "canal", label: "Canal" },
  { value: "borewell", label: "Borewell" },
  { value: "other", label: "Other" },
];

const FarmFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  soilFilter,
  onSoilChange,
  irrigationFilter,
  onIrrigationChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    soilFilter !== "all" ||
    irrigationFilter !== "all";

  return (
    <div className="farms-filters-container">
      <div className="farms-search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search farms by name, district, village, state..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search farms"
        />
      </div>

      <div className="farms-filter-group">
        <div className="filter-select-wrapper">
          <Filter size={14} className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="filter-select-wrapper">
          <select
            value={soilFilter}
            onChange={(e) => onSoilChange(e.target.value)}
            aria-label="Filter by soil type"
          >
            {SOIL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-wrapper">
          <select
            value={irrigationFilter}
            onChange={(e) => onIrrigationChange(e.target.value)}
            aria-label="Filter by irrigation type"
          >
            {IRRIGATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onResetFilters}
            title="Reset filters"
            aria-label="Reset filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FarmFilters;
