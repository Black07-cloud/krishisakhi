import React, { useState } from "react";
import { Search, Filter, X, RefreshCw } from "lucide-react";
import { formatCategoryLabel } from "./SchemeCard";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "crop", label: "Crop Management" },
  { value: "irrigation", label: "Irrigation" },
  { value: "equipment", label: "Farm Equipment" },
  { value: "insurance", label: "Crop Insurance" },
  { value: "finance", label: "Financial Support" },
  { value: "soil", label: "Soil Health" },
  { value: "fertilizer", label: "Fertilizers & Subsidies" },
  { value: "farmer_welfare", label: "Farmer Welfare" },
  { value: "horticulture", label: "Horticulture" },
  { value: "organic_farming", label: "Organic Farming" },
  { value: "solar", label: "Solar Energy" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "other", label: "Other Support" },
];

const SchemeFilters = ({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  selectedLevel,
  onLevelChange,
  selectedCategory,
  onCategoryChange,
  availableStates = [],
  availableCategories = [],
  availableLevels = [],
  onClearFilters,
  totalResults,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedState !== "" ||
    selectedLevel !== "" ||
    selectedCategory !== "";

  // Merge available states from backend with option list
  const stateOptions = ["", ...availableStates.filter(Boolean)];
  
  // Merge categories from backend metadata if provided
  const categoryOptions = availableCategories.length > 0
    ? [{ value: "", label: "All Categories" }, ...availableCategories.map(cat => ({
        value: cat,
        label: formatCategoryLabel(cat)
      }))]
    : CATEGORY_OPTIONS;

  return (
    <div className="scheme-filters-container">
      {/* Top Bar: Search + Mobile Filter Toggle */}
      <div className="scheme-search-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="scheme-search-input"
            placeholder="Search government schemes by name, keyword, category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search government schemes"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`mobile-filter-toggle-btn ${showMobileFilters ? "active" : ""}`}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Filter size={16} />
          <span>Filters</span>
          {hasActiveFilters && <span className="filter-badge-dot" />}
        </button>
      </div>

      {/* Filter Controls (Desktop & Mobile Drawer) */}
      <div className={`scheme-filter-controls ${showMobileFilters ? "open" : ""}`}>
        <div className="filter-group">
          <label htmlFor="scheme-state-select">State / Region</label>
          <select
            id="scheme-state-select"
            className="scheme-select"
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
          >
            <option value="">All States / All India</option>
            {stateOptions.map((st) => (
              st ? <option key={st} value={st}>{st}</option> : null
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="scheme-level-select">Level</label>
          <select
            id="scheme-level-select"
            className="scheme-select"
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="central">Central Government</option>
            <option value="state">State Government</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="scheme-category-select">Category</label>
          <select
            id="scheme-category-select"
            className="scheme-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={onClearFilters}
          >
            <RefreshCw size={14} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Results summary bar */}
      <div className="results-summary-bar">
        <span className="results-count">
          {totalResults !== undefined ? `${totalResults} ${totalResults === 1 ? 'scheme' : 'schemes'} found` : "Loading schemes..."}
        </span>
      </div>
    </div>
  );
};

export default SchemeFilters;
