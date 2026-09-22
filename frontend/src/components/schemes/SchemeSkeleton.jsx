import React from "react";

const SchemeSkeleton = ({ count = 6 }) => {
  return (
    <div className="scheme-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="scheme-card skeleton-card">
          <div className="skeleton-badges">
            <div className="skeleton-pill short"></div>
            <div className="skeleton-pill medium"></div>
          </div>
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
          <div className="skeleton-footer">
            <div className="skeleton-pill short"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchemeSkeleton;
