import { useState } from "react";
import { History, Eye, Trash2, Calendar, Search, Filter } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const SEVERITY_CLASSES = {
  healthy: "sev-healthy",
  mild: "sev-mild",
  moderate: "sev-moderate",
  severe: "sev-severe",
  unknown: "sev-unknown",
};

const DiseaseHistory = ({
  scans = [],
  onViewScan,
  onDeleteScan,
  loading = false,
  farms = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filteredScans = scans.filter((scan) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cropName = typeof scan.crop === "object" ? scan.crop?.name : "";
      const diseaseName = scan.detectedDisease || "";
      const matchCrop = cropName.toLowerCase().includes(q);
      const matchDisease = diseaseName.toLowerCase().includes(q);
      if (!matchCrop && !matchDisease) return false;
    }

    // Status filter
    if (statusFilter !== "all" && scan.status !== statusFilter) return false;

    // Severity filter
    if (severityFilter !== "all" && scan.severity !== severityFilter) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="disease-history-card skeleton-card" style={{ height: "260px" }} />
    );
  }

  return (
    <div className="disease-history-card">
      <div className="history-header">
        <h3 className="section-title">
          <History size={18} /> Disease Scan History ({scans.length})
        </h3>

        {/* Filter Controls */}
        <div className="history-filters-group">
          <div className="farms-search-box" style={{ minWidth: "180px" }}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search crop or disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search scans"
            />
          </div>

          <div className="filter-select-wrapper">
            <Filter size={13} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="analyzed">Analyzed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filter by severity"
            >
              <option value="all">All Severities</option>
              <option value="healthy">Healthy</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
      </div>

      {filteredScans.length === 0 ? (
        <div className="history-empty-box">
          <p>
            {scans.length === 0
              ? "Your disease scan history will appear here once you run your first scan."
              : "No scans match your search or filter selection."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="history-table-wrapper">
            <table className="disease-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Crop</th>
                  <th>Detected Condition</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan) => {
                  const cropName = typeof scan.crop === "object" ? scan.crop?.name : "Crop";
                  const sevClass = SEVERITY_CLASSES[scan.severity] || "sev-unknown";
                  const confPct = scan.confidence !== null && scan.confidence !== undefined
                    ? scan.confidence <= 1 ? `${Math.round(scan.confidence * 100)}%` : `${Math.round(scan.confidence)}%`
                    : "N/A";

                  return (
                    <tr key={scan._id}>
                      <td className="due-date-cell">
                        <Calendar size={13} /> {formatDate(scan.scannedAt)}
                      </td>
                      <td className="font-semibold">{cropName}</td>
                      <td>
                        <span className="disease-name-cell">
                          {scan.detectedDisease || (scan.severity === "healthy" ? "Healthy Crop" : "Unspecified")}
                        </span>
                      </td>
                      <td>
                        <span className={`severity-badge ${sevClass}`}>
                          {capitalize(scan.severity || "unknown")}
                        </span>
                      </td>
                      <td>{confPct}</td>
                      <td>
                        <span className={`status-pill badge-status-${scan.status}`}>
                          ● {capitalize(scan.status || "pending")}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn-icon action-view"
                            onClick={() => onViewScan(scan)}
                            title="View Scan Details"
                            aria-label="View Scan Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon action-delete"
                            onClick={() => onDeleteScan(scan)}
                            title="Delete Scan"
                            aria-label="Delete Scan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="history-mobile-cards">
            {filteredScans.map((scan) => {
              const cropName = typeof scan.crop === "object" ? scan.crop?.name : "Crop";
              const sevClass = SEVERITY_CLASSES[scan.severity] || "sev-unknown";

              return (
                <div key={scan._id} className="scan-mobile-card">
                  <div className="mobile-card-header">
                    <span className="mobile-crop-title">{cropName}</span>
                    <span className={`severity-badge ${sevClass}`}>
                      {capitalize(scan.severity || "unknown")}
                    </span>
                  </div>

                  <p className="mobile-disease-text">
                    {scan.detectedDisease || (scan.severity === "healthy" ? "Healthy Crop" : "Unspecified")}
                  </p>

                  <div className="mobile-card-meta">
                    <span className="meta-due">
                      <Calendar size={13} /> {formatDate(scan.scannedAt)}
                    </span>
                    <span className={`status-pill badge-status-${scan.status}`}>
                      {capitalize(scan.status || "pending")}
                    </span>
                  </div>

                  <div className="mobile-card-actions">
                    <button
                      type="button"
                      className="btn-card-action action-view"
                      onClick={() => onViewScan(scan)}
                    >
                      <Eye size={14} /> View Details
                    </button>
                    <button
                      type="button"
                      className="btn-card-action action-delete"
                      onClick={() => onDeleteScan(scan)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default DiseaseHistory;
