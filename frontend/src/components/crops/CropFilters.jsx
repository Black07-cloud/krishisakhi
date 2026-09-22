import { Search, Filter, RotateCcw, ArrowUpDown } from "lucide-react";

export const CROP_STAGES = [
  { value: "seed", label: "Seed" },
  { value: "germination", label: "Germination" },
  { value: "vegetative", label: "Vegetative" },
  { value: "flowering", label: "Flowering" },
  { value: "fruiting", label: "Fruiting" },
  { value: "maturity", label: "Maturity" },
  { value: "harvest", label: "Harvest" },
];

export const CROP_STATUSES = [
  { value: "active", label: "Active" },
  { value: "harvested", label: "Harvested" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const CropFilters = ({
  searchQuery,
  onSearchChange,
  farmFilter,
  onFarmChange,
  stageFilter,
  onStageChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  farms = [],
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    farmFilter !== "all" ||
    stageFilter !== "all" ||
    statusFilter !== "all" ||
    sortBy !== "newest";

  return (
    <div className="crops-filters-container">
      <div className="crops-search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search crops by name, variety, farm..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search crops"
        />
      </div>

      <div className="crops-filter-group">
        {/* Farm filter */}
        <div className="filter-select-wrapper">
          <Filter size={14} className="filter-icon" />
          <select
            value={farmFilter}
            onChange={(e) => onFarmChange(e.target.value)}
            aria-label="Filter by farm"
          >
            <option value="all">All Farms</option>
            {farms.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stage filter */}
        <div className="filter-select-wrapper">
          <select
            value={stageFilter}
            onChange={(e) => onStageChange(e.target.value)}
            aria-label="Filter by stage"
          >
            <option value="all">All Stages</option>
            {CROP_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="filter-select-wrapper">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {CROP_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="filter-select-wrapper">
          <ArrowUpDown size={14} className="filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort crops"
          >
            <option value="newest">Newest Added</option>
            <option value="planting">Planting Date</option>
            <option value="harvest">Expected Harvest</option>
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

export default CropFilters;
