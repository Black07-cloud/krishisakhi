import React, { useState } from "react";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { createEnquiry } from "../../api/marketApi";
import { formatCurrency } from "../finance/SummaryCards";

const EnquiryModal = ({ listing, onClose, onSuccess }) => {
  const [message, setMessage] = useState(
    `Hello! I am interested in purchasing your ${listing?.cropName || "crop"} produce listed at ${formatCurrency(listing?.expectedPrice || 0)}/${listing?.priceUnit || "quintal"}. Please contact me to discuss terms.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please write a message for the seller.");
      return;
    }

    setSubmitting(true);
    try {
      await createEnquiry(listing._id || listing.id, { message: message.trim() });
      onSuccess();
    } catch (err) {
      console.error("Failed to send enquiry:", err);
      setError(err?.data?.message || err?.message || "Unable to send enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scheme-modal-overlay" onClick={onClose}>
      <div
        className="scheme-modal-container transaction-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scheme-modal-header">
          <div className="scheme-modal-header-top">
            <h2 className="scheme-modal-title">Contact Seller / Send Enquiry</h2>
            <button
              className="scheme-modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
            Listing: <strong>{listing.title}</strong> ({listing.cropName})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="scheme-modal-body">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="listing-summary-snippet">
            <div>
              <span className="snippet-label">Quantity Available</span>
              <span className="snippet-val">{listing.quantity} {listing.quantityUnit}</span>
            </div>
            <div>
              <span className="snippet-label">Expected Price</span>
              <span className="snippet-val text-income">
                {formatCurrency(listing.expectedPrice)} / {listing.priceUnit}
              </span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label">Message to Seller</label>
            <textarea
              className="form-textarea"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={1000}
            />
          </div>

          <div className="scheme-modal-footer" style={{ padding: 0, marginTop: "1rem", background: "transparent" }}>
            <button
              type="button"
              className="modal-close-action-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="official-link-btn primary"
              disabled={submitting}
            >
              <Send size={16} />
              <span>{submitting ? "Sending..." : "Send Enquiry"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnquiryModal;
