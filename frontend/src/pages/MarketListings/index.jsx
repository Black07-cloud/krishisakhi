import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBasket,
  Search,
  MapPin,
  Tag,
  Filter,
  RefreshCw,
  MessageCircle,
  X,
  User,
  Calendar,
  AlertCircle,
  Building,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getListings } from "../../api/marketApi";
import ListingCard from "../../components/market/ListingCard";
import EnquiryModal from "../../components/market/EnquiryModal";
import { formatCurrency } from "../../components/finance/SummaryCards";

const MarketListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedListingDetails, setSelectedListingDetails] = useState(null);
  const [enquiryListing, setEnquiryListing] = useState(null);
  const [enquirySentSuccess, setEnquirySentSuccess] = useState(false);

  const fetchPublicListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListings({
        search: searchQuery || undefined,
        crop: selectedCrop || undefined,
        state: selectedState || undefined,
        district: selectedDistrict || undefined,
        page,
        limit: 12,
      });

      if (res && res.success) {
        setListings(res.data.listings || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        throw new Error(res?.message || "Failed to load marketplace listings.");
      }
    } catch (err) {
      console.error("Error loading marketplace listings:", err);
      setError(err?.message || "Unable to load crop listings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCrop, selectedState, selectedDistrict, page]);

  useEffect(() => {
    fetchPublicListings();
  }, [fetchPublicListings]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCrop("");
    setSelectedState("");
    setSelectedDistrict("");
    setPage(1);
  };

  const handleEnquirySuccess = () => {
    setEnquiryListing(null);
    setEnquirySentSuccess(true);
    setTimeout(() => setEnquirySentSuccess(false), 4000);
  };

  const cropsList = Array.from(new Set(listings.map((l) => l.cropName).filter(Boolean)));
  const statesList = Array.from(new Set(listings.map((l) => l.location?.state).filter(Boolean)));
  const districtsList = Array.from(new Set(listings.map((l) => l.location?.district).filter(Boolean)));

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(selectedCrop) ||
    Boolean(selectedState) ||
    Boolean(selectedDistrict);

  return (
    <div className="market-page">
      {/* Header */}
      <header className="finance-header">
        <div className="finance-header-left">
          <div className="finance-header-icon">
            <ShoppingBasket size={26} />
          </div>
          <div>
            <h1>Crop Marketplace</h1>
            <p>Browse active produce listings directly from verified farmers.</p>
          </div>
        </div>

        <div className="market-header-actions">
          <Link to="/market/sell" className="add-transaction-btn">
            <span>Sell Your Crop</span>
          </Link>
          <Link to="/market/my-listings" className="secondary-header-btn">
            <span>My Listings</span>
          </Link>
        </div>
      </header>

      {/* Success Notification */}
      {enquirySentSuccess && (
        <div className="market-data-indicator-banner live-banner" style={{ marginBottom: "1.5rem" }}>
          <span>Your enquiry has been sent to the seller successfully! They will get back to you shortly.</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="scheme-filters-container">
        <div className="scheme-search-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="scheme-search-input"
              placeholder="Search produce listings by crop, title, or region..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="scheme-filter-controls" style={{ display: "flex" }}>
          <div className="filter-group">
            <label htmlFor="buy-crop-select">Crop</label>
            <select
              id="buy-crop-select"
              className="scheme-select"
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Crops</option>
              {cropsList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="buy-state-select">State</label>
            <select
              id="buy-state-select"
              className="scheme-select"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All States</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="buy-dist-select">District</label>
            <select
              id="buy-dist-select"
              className="scheme-select"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Districts</option>
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className="clear-filters-btn"
              onClick={handleClearFilters}
              style={{ height: "40px" }}
            >
              <RefreshCw size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Listings Grid */}
      {loading ? (
        <div className="scheme-error-state" style={{ border: "none" }}>
          <p>Loading marketplace listings...</p>
        </div>
      ) : error ? (
        <div className="scheme-error-state">
          <div className="error-icon-wrapper">
            <AlertCircle size={36} />
          </div>
          <h3>Unable to load crop listings</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchPublicListings}>
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="scheme-empty-state">
          <div className="empty-icon-wrapper">
            <ShoppingBasket size={44} />
          </div>
          <h3>No crop listings available</h3>
          <p>
            {hasActiveFilters
              ? "No crop listings matched your current filters. Try changing your search query or region."
              : "There are currently no active crop listings available in the marketplace."}
          </p>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              <RefreshCw size={14} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="scheme-grid">
            {listings.map((item) => (
              <ListingCard
                key={item._id || item.id}
                listing={item}
                onViewDetails={(lst) => setSelectedListingDetails(lst)}
                onSendEnquiry={(lst) => setEnquiryListing(lst)}
              />
            ))}
          </div>

          {/* Pagination */}
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

      {/* Listing Details Modal */}
      {selectedListingDetails && (
        <div className="scheme-modal-overlay" onClick={() => setSelectedListingDetails(null)}>
          <div className="scheme-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="scheme-modal-header">
              <div className="scheme-modal-header-top">
                <div className="scheme-badges">
                  <span className="category-badge">
                    <Tag size={13} />
                    {selectedListingDetails.cropName}
                  </span>
                  <span className="status-badge active">
                    {selectedListingDetails.status?.toUpperCase()}
                  </span>
                </div>
                <button
                  className="scheme-modal-close-btn"
                  onClick={() => setSelectedListingDetails(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <h2 className="scheme-modal-title">{selectedListingDetails.title}</h2>
              <div className="scheme-modal-meta">
                <span className="meta-item">
                  <MapPin size={14} />
                  {[selectedListingDetails.location?.district, selectedListingDetails.location?.state].filter(Boolean).join(", ")}
                </span>
                <span className="meta-item">
                  <User size={14} />
                  Farmer: {selectedListingDetails.seller?.name || "Verified Farmer"}
                </span>
              </div>
            </div>

            <div className="scheme-modal-body">
              <div className="listing-summary-snippet">
                <div>
                  <span className="snippet-label">Quantity Available</span>
                  <span className="snippet-val">{selectedListingDetails.quantity} {selectedListingDetails.quantityUnit}</span>
                </div>
                <div>
                  <span className="snippet-label">Expected Price</span>
                  <span className="snippet-val text-income">
                    {formatCurrency(selectedListingDetails.expectedPrice)} / {selectedListingDetails.priceUnit}
                  </span>
                </div>
              </div>

              <section className="scheme-section">
                <h3 className="section-heading">Description & Crop Quality</h3>
                <p className="scheme-body-description">
                  {selectedListingDetails.description || "No description provided."}
                </p>
              </section>
            </div>

            <div className="scheme-modal-footer">
              <button
                className="modal-close-action-btn"
                onClick={() => setSelectedListingDetails(null)}
              >
                Close
              </button>
              <button
                className="official-link-btn primary"
                onClick={() => {
                  const lst = selectedListingDetails;
                  setSelectedListingDetails(null);
                  setEnquiryListing(lst);
                }}
              >
                <MessageCircle size={16} />
                <span>Contact Seller</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Enquiry Modal */}
      {enquiryListing && (
        <EnquiryModal
          listing={enquiryListing}
          onClose={() => setEnquiryListing(null)}
          onSuccess={handleEnquirySuccess}
        />
      )}
    </div>
  );
};

export default MarketListings;
