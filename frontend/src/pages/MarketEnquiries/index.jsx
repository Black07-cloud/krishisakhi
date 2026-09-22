import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getSellerEnquiries,
  getMyEnquiries,
  updateEnquiryStatus,
} from "../../api/marketApi";
import { formatCurrency } from "../../components/finance/SummaryCards";

const MarketEnquiries = () => {
  const [activeTab, setActiveTab] = useState("seller"); // "seller" or "buyer"
  const [sellerEnquiries, setSellerEnquiries] = useState([]);
  const [buyerEnquiries, setBuyerEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "seller") {
        const res = await getSellerEnquiries();
        if (res && res.success) {
          setSellerEnquiries(res.data || []);
        }
      } else {
        const res = await getMyEnquiries();
        if (res && res.success) {
          setBuyerEnquiries(res.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading enquiries:", err);
      setError("Unable to load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [activeTab]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateEnquiryStatus(id, status);
      fetchEnquiries();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const currentList = activeTab === "seller" ? sellerEnquiries : buyerEnquiries;

  return (
    <div className="market-page">
      {/* Header */}
      <header className="finance-header">
        <div className="finance-header-left">
          <div className="finance-header-icon">
            <MessageCircle size={26} />
          </div>
          <div>
            <h1>Market Enquiries</h1>
            <p>Track buyer inquiries and seller contact responses.</p>
          </div>
        </div>

        <div className="market-header-actions">
          <Link to="/market/buy" className="secondary-header-btn">
            <span>Browse Marketplace</span>
          </Link>
          <Link to="/market/my-listings" className="secondary-header-btn">
            <span>My Listings</span>
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="type-toggle-group" style={{ maxWidth: "400px", marginBottom: "1.5rem" }}>
        <button
          className={`type-toggle-btn ${activeTab === "seller" ? "income active" : ""}`}
          onClick={() => setActiveTab("seller")}
        >
          Received Enquiries (Seller)
        </button>
        <button
          className={`type-toggle-btn ${activeTab === "buyer" ? "income active" : ""}`}
          onClick={() => setActiveTab("buyer")}
        >
          Sent Enquiries (Buyer)
        </button>
      </div>

      {loading ? (
        <div className="scheme-error-state" style={{ border: "none" }}>
          <p>Loading enquiries...</p>
        </div>
      ) : error ? (
        <div className="scheme-error-state">
          <div className="error-icon-wrapper">
            <AlertCircle size={36} />
          </div>
          <h3>Unable to load enquiries</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchEnquiries}>
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : currentList.length === 0 ? (
        <div className="scheme-empty-state">
          <div className="empty-icon-wrapper">
            <MessageCircle size={44} />
          </div>
          <h3>No {activeTab === "seller" ? "received" : "sent"} enquiries</h3>
          <p>
            {activeTab === "seller"
              ? "When buyers express interest in your crop listings, their enquiries will appear here."
              : "When you contact crop sellers on the marketplace, your sent enquiries will appear here."}
          </p>
        </div>
      ) : (
        <section className="transaction-list-section">
          <div className="section-title-bar">
            <h2>
              {activeTab === "seller" ? "Enquiries on Your Produce" : "Enquiries You Sent"}
            </h2>
            <span className="results-count">{currentList.length} enquiries</span>
          </div>

          <div className="scheme-grid">
            {currentList.map((enq) => {
              const formattedDate = enq.createdAt
                ? new Date(enq.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "";

              const contactPerson = activeTab === "seller" ? enq.buyer : enq.seller;

              return (
                <div key={enq._id || enq.id} className="scheme-card">
                  <div className="scheme-card-header">
                    <div className="scheme-badges">
                      <span
                        className={`status-badge ${
                          enq.status === "accepted"
                            ? "active"
                            : enq.status === "rejected"
                            ? "inactive"
                            : "level-state"
                        }`}
                      >
                        {enq.status?.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="scheme-title">{enq.listing?.title || enq.listing?.cropName}</h3>
                  </div>

                  <p className="scheme-description" style={{ fontStyle: "italic", color: "#334155" }}>
                    "{enq.message}"
                  </p>

                  <div className="listing-info-grid" style={{ marginBottom: "1rem" }}>
                    <div className="info-item">
                      <span className="info-label">{activeTab === "seller" ? "Buyer:" : "Seller:"}</span>
                      <span className="info-val">
                        <User size={13} />
                        {contactPerson?.name || "Farmer / Buyer"}
                      </span>
                    </div>
                    {contactPerson?.phone && enq.status === "accepted" && (
                      <div className="info-item">
                        <span className="info-label">Phone:</span>
                        <span className="info-val" style={{ color: "#16a34a" }}>
                          <Phone size={13} />
                          {contactPerson.phone}
                        </span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-val">{formattedDate}</span>
                    </div>
                  </div>

                  {activeTab === "seller" && enq.status === "pending" && (
                    <div className="scheme-card-footer">
                      <button
                        className="official-link-btn primary"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                        onClick={() => handleStatusUpdate(enq._id || enq.id, "accepted")}
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept & Share Contact</span>
                      </button>
                      <button
                        className="modal-close-action-btn"
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                        onClick={() => handleStatusUpdate(enq._id || enq.id, "rejected")}
                      >
                        <XCircle size={14} />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default MarketEnquiries;
