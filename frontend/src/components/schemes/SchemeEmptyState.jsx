import React from "react";
import { Landmark, RefreshCw } from "lucide-react";

const SchemeEmptyState = ({ onClearFilters, isFiltered }) => {
  return (
    <div className="scheme-empty-state">
      <div className="empty-icon-wrapper">
        <Landmark size={48} />
      </div>
      <h3>No government schemes found</h3>
      <p>
        {isFiltered
          ? "No schemes matched your current search or filter criteria. Try adjusting your search query or state/category filters."
          : "There are currently no active government schemes available to display."}
      </p>
      {isFiltered && onClearFilters && (
        <button className="clear-filters-btn" onClick={onClearFilters}>
          <RefreshCw size={16} />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};

export default SchemeEmptyState;
