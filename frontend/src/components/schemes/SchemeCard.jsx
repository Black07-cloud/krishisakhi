import React from "react";
import {
  Landmark,
  MapPin,
  Tag,
  ChevronRight,
  ShieldCheck,
  Building,
} from "lucide-react";

// Category label formatting helper
export const formatCategoryLabel = (category) => {
  if (!category) return "";
  const map = {
    crop: "Crop Management",
    irrigation: "Irrigation",
    equipment: "Farm Equipment",
    insurance: "Crop Insurance",
    finance: "Financial Support",
    soil: "Soil Health",
    fertilizer: "Fertilizers & Subsidies",
    farmer_welfare: "Farmer Welfare",
    horticulture: "Horticulture",
    organic_farming: "Organic Farming",
    solar: "Solar Energy",
    infrastructure: "Infrastructure",
    other: "Other Support",
  };
  return map[category.toLowerCase()] || category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const SchemeCard = ({ scheme, onViewDetails }) => {
  const {
    name,
    shortName,
    description,
    state,
    level,
    category,
    isActive,
  } = scheme;

  return (
    <div className="scheme-card">
      <div className="scheme-card-header">
        <div className="scheme-badges">
          <span className={`level-badge ${level === "central" ? "level-central" : "level-state"}`}>
            <Building size={12} />
            {level === "central" ? "Central Government" : "State Government"}
          </span>
          {category && (
            <span className="category-badge">
              <Tag size={12} />
              {formatCategoryLabel(category)}
            </span>
          )}
          {isActive === false && (
            <span className="status-badge inactive">Inactive</span>
          )}
        </div>

        <h3 className="scheme-title">
          {name}
          {shortName && <span className="scheme-short-name"> ({shortName})</span>}
        </h3>
      </div>

      <p className="scheme-description">
        {description}
      </p>

      <div className="scheme-card-footer">
        <div className="scheme-meta">
          <span className="scheme-state">
            <MapPin size={14} />
            {state || "All India"}
          </span>
        </div>

        <button
          className="scheme-details-btn"
          onClick={() => onViewDetails(scheme)}
          aria-label={`View details for ${name}`}
        >
          <span>View Details</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SchemeCard;
