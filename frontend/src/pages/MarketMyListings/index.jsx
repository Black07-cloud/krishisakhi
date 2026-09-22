import React, { useState, useEffect } from "react";
import {
  ShoppingBasket,
  Plus,
  RefreshCw,
  CheckCircle2,
  Trash2,
  MessageCircle,
  Tag,
  AlertCircle,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMyListings, updateListingStatus, deleteListing } from "../../api/marketApi";
import { formatCurrency } from "../../components/finance/SummaryCards";

const MarketMyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyListings();
      if (res && res.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      console.error("Error fetching my listings:", err);
      setError("Unable to load your crop listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleMarkSold = async (id) => {
    try {
      await updateListingStatus(id, "sold");
      fetchMyListings();
    } catch (err) {
      console.error("Failed to mark as sold:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteListing(id);
      fetchMyListings();
    } catch (err) {
      console.error("Failed to delete listing:", err);
    }
  };

  return (
    <div className="market-page">
      {/* Header */}
      <header className="finance-header">
        <div className="finance-header-left">
          <div className="finance-header-icon">
            <ShoppingBasket size={26} />
          </div>
          <div>
            <h1>My Crop Listings</h1>
            <p>Manage your active produce listings and update availability status.</p>
          </div>
        </div>

        <div className="market-header-actions">
          <Link to="/market/sell" className="add-transaction-btn">
            <Plus size={18} />
            <span>Publish New Listing</span>
          </Link>
          <Link to="/market/enquiries" className="secondary-header-btn">
            <MessageCircle size={18} />
            <span>View Buyer Enquiries</span>
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="scheme-error-state" style={{ border: "none" }}>
          <p>Loading your listings...</p>
        </div>
      ) : error ? (
        <div className="scheme-error-state">
          <div className="error-icon-wrapper">
            <AlertCircle size={36} />
          </div>
          <h3>Unable to load listings</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchMyListings}>
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="scheme-empty-state">
          <div className="empty-icon-wrapper">
            <ShoppingBasket size={44} />
          </div>
          <h3>You haven't listed any crops yet</h3>
          <p>Publish your harvest produce to reach potential buyers and local markets.</p>
          <Link to="/market/sell" className="official-link-btn primary">
            Publish First Listing
          </Link>
        </div>
      ) : (
        <section className="transaction-list-section">
          <div className="section-title-bar">
            <h2>Your Active & Past Listings</h2>
            <span className="results-count">{listings.length} listings</span>
          </div>

          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Title</th>
                  <th>Quantity</th>
                  <th>Expected Price</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => {
                  const isSold = item.status === "sold";
                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A";

                  return (
                    <tr key={item._id || item.id} className="transaction-row">
                      <td className="tx-cell-category">
                        <span className="category-title">{item.cropName}</span>
                      </td>
                      <td className="farm-name-text">{item.title}</td>
                      <td>
                        {item.quantity} {item.quantityUnit}
                      </td>
                      <td>
                        <span className="amount-text text-income">
                          {formatCurrency(item.expectedPrice)} / {item.priceUnit}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${isSold ? "inactive" : "active"}`}>
                          {item.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="date-text">{formattedDate}</td>
                      <td>
                        <div className="table-action-btns">
                          {!isSold && (
                            <button
                              className="official-link-btn primary"
                              style={{ padding: "0.25rem 0.6rem", fontSize: "0.775rem" }}
                              onClick={() => handleMarkSold(item._id || item.id)}
                            >
                              <CheckCircle2 size={13} />
                              <span>Mark Sold</span>
                            </button>
                          )}
                          <button
                            className="tx-action-btn delete"
                            onClick={() => handleDelete(item._id || item.id)}
                            title="Delete Listing"
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
        </section>
      )}
    </div>
  );
};

export default MarketMyListings;
