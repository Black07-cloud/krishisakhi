import React, { useState, useEffect, useCallback } from "react";
import {
  Landmark,
  FileText,
  BadgeIndianRupee,
  Sprout,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { getSchemes, getSchemeFilters } from "../../api/schemeApi";
import SchemeCard from "../../components/schemes/SchemeCard";
import SchemeFilters from "../../components/schemes/SchemeFilters";
import SchemeDetailsModal from "../../components/schemes/SchemeDetailsModal";
import SchemeEmptyState from "../../components/schemes/SchemeEmptyState";
import SchemeSkeleton from "../../components/schemes/SchemeSkeleton";
import "./Schemes.css";

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Metadata filter options from backend
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);

  // Modal detail view
  const [activeScheme, setActiveScheme] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch scheme filters metadata once
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const res = await getSchemeFilters();
        if (res && res.success && isMounted) {
          setAvailableStates(res.data?.states || []);
          setAvailableCategories(res.data?.categories || []);
          setAvailableLevels(res.data?.levels || []);
        }
      } catch (err) {
        console.error("Failed to load scheme filters metadata:", err);
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch schemes from backend API
  const fetchSchemesList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 20,
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedState) params.state = selectedState;
      if (selectedLevel) params.level = selectedLevel;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await getSchemes(params);

      if (res && res.success) {
        setSchemes(res.data || []);
        setTotalCount(res.total || res.count || (res.data ? res.data.length : 0));
        setTotalPages(res.pages || 1);
      } else {
        throw new Error(res?.message || "Failed to load government schemes.");
      }
    } catch (err) {
      console.error("Error loading government schemes:", err);
      setError(err?.message || "Unable to load government schemes. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedState, selectedLevel, searchQuery, page]);

  useEffect(() => {
    fetchSchemesList();
  }, [fetchSchemesList]);

  // Reset page to 1 when filters change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStateChange = (stateVal) => {
    setSelectedState(stateVal);
    setPage(1);
  };

  const handleLevelChange = (levelVal) => {
    setSelectedLevel(levelVal);
    setPage(1);
  };

  const handleCategoryChange = (categoryVal) => {
    setSelectedCategory(categoryVal);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedState("");
    setSelectedLevel("");
    setSelectedCategory("");
    setPage(1);
  };

  // Client-side fallback filtering if search text is entered (for immediate text match responsiveness)
  const filteredSchemes = schemes.filter((scheme) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = scheme.name?.toLowerCase().includes(query);
    const shortNameMatch = scheme.shortName?.toLowerCase().includes(query);
    const descMatch = scheme.description?.toLowerCase().includes(query);
    const categoryMatch = scheme.category?.toLowerCase().includes(query);
    return nameMatch || shortNameMatch || descMatch || categoryMatch;
  });

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    Boolean(selectedState) ||
    Boolean(selectedLevel) ||
    Boolean(selectedCategory);

  return (
    <div className="schemes-page">
      {/* Header */}
      <header className="schemes-header">
        <div className="header-content">
          <div className="header-title-row">
            <div className="header-icon">
              <Landmark size={24} />
            </div>
            <h1>Government Schemes</h1>
          </div>
          <p>Discover government schemes and support available for farmers.</p>
        </div>

        <div className="header-meta-pills">
          <div className="meta-pill">
            <FileText size={14} />
            <span>Official Information</span>
          </div>
          <div className="meta-pill">
            <BadgeIndianRupee size={14} />
            <span>Subsidies & Grants</span>
          </div>
          <div className="meta-pill">
            <Sprout size={14} />
            <span>Farmer Welfare</span>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <SchemeFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedState={selectedState}
        onStateChange={handleStateChange}
        selectedLevel={selectedLevel}
        onLevelChange={handleLevelChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        availableStates={availableStates}
        availableCategories={availableCategories}
        availableLevels={availableLevels}
        onClearFilters={handleClearFilters}
        totalResults={loading ? undefined : filteredSchemes.length}
      />

      {/* Main Content Area */}
      {loading ? (
        <SchemeSkeleton count={6} />
      ) : error ? (
        <div className="scheme-error-state">
          <div className="error-icon-wrapper">
            <AlertCircle size={40} />
          </div>
          <h3>Unable to load government schemes</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchSchemesList}>
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <SchemeEmptyState
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />
      ) : (
        <>
          <div className="scheme-grid">
            {filteredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme._id || scheme.id || scheme.name}
                scheme={scheme}
                onViewDetails={(s) => setActiveScheme(s)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="schemes-pagination">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {activeScheme && (
        <SchemeDetailsModal
          scheme={activeScheme}
          onClose={() => setActiveScheme(null)}
        />
      )}
    </div>
  );
};

export default Schemes;
