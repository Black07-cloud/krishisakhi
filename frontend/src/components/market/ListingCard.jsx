import React from "react";
import { MapPin, Calendar, Tag, User, MessageCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../finance/SummaryCards";

const ListingCard = ({ listing, onViewDetails, onSendEnquiry, isOwner = false }) => {
  const {
    _id,
    title,
    cropName,
    quantity,
    quantityUnit = "quintal",
    expectedPrice,
    priceUnit = "quintal",
    location,
    availableFrom,
    status = "active",
    seller,
  } = listing;

  const formattedLocation = location
    ? [location.district, location.state].filter(Boolean).join(", ")
    : "Location on request";

  const formattedDate = availableFrom
    ? new Date(availableFrom).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Immediate";

  return (
    <div className="scheme-card listing-card">
      <div className="scheme-card-header">
        <div className="scheme-badges">
          <span className={`status-badge ${status === "active" ? "active" : "inactive"}`}>
            {status.toUpperCase()}
          </span>
          <span className="category-badge">
            <Tag size={12} />
            {cropName}
          </span>
        </div>

        <h3 className="scheme-title">{title}</h3>
      </div>

      <div className="listing-card-body">
        <div className="listing-price-box">
          <span className="price-label">Expected Price</span>
          <span className="price-value text-income">
            {formatCurrency(expectedPrice)} <span className="unit-sub">/ {priceUnit}</span>
          </span>
        </div>

        <div className="listing-info-grid">
          <div className="info-item">
            <span className="info-label">Quantity:</span>
            <span className="info-val">{quantity} {quantityUnit}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location:</span>
            <span className="info-val">
              <MapPin size={13} />
              {formattedLocation}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Available:</span>
            <span className="info-val">
              <Calendar size={13} />
              {formattedDate}
            </span>
          </div>
          {seller?.name && (
            <div className="info-item">
              <span className="info-label">Farmer:</span>
              <span className="info-val">
                <User size={13} />
                {seller.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="scheme-card-footer" style={{ marginTop: "1rem" }}>
        <button
          className="modal-close-action-btn"
          style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
          onClick={() => onViewDetails(listing)}
        >
          Details
        </button>

        {!isOwner && status === "active" && onSendEnquiry && (
          <button
            className="scheme-details-btn"
            onClick={() => onSendEnquiry(listing)}
          >
            <MessageCircle size={15} />
            <span>Contact Seller</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
