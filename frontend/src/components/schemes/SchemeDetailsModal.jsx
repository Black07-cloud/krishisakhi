import React, { useEffect } from "react";
import {
  X,
  Building,
  Tag,
  MapPin,
  ExternalLink,
  Phone,
  Calendar,
  CheckCircle2,
  FileText,
  HelpCircle,
  Award,
  ListOrdered,
  Bot,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCategoryLabel } from "./SchemeCard";

const SchemeDetailsModal = ({ scheme, onClose }) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!scheme) return null;

  const {
    name,
    shortName,
    description,
    state,
    level,
    category,
    benefits = [],
    eligibility = [],
    requiredDocuments = [],
    applicationProcess = [],
    officialUrl,
    informationUrl,
    helpline,
    lastUpdated,
    source,
    isActive = true,
  } = scheme;

  return (
    <div className="scheme-modal-overlay" onClick={onClose}>
      <div
        className="scheme-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheme-modal-title"
      >
        {/* Modal Header */}
        <div className="scheme-modal-header">
          <div className="scheme-modal-header-top">
            <div className="scheme-badges">
              <span className={`level-badge ${level === "central" ? "level-central" : "level-state"}`}>
                <Building size={13} />
                {level === "central" ? "Central Government" : "State Government"}
              </span>
              {category && (
                <span className="category-badge">
                  <Tag size={13} />
                  {formatCategoryLabel(category)}
                </span>
              )}
              <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
                {isActive ? "Active Scheme" : "Inactive"}
              </span>
            </div>

            <button
              className="scheme-modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <h2 id="scheme-modal-title" className="scheme-modal-title">
            {name}
            {shortName && <span className="scheme-modal-shortname"> ({shortName})</span>}
          </h2>

          <div className="scheme-modal-meta">
            <span className="meta-item">
              <MapPin size={15} />
              {state || "All India"}
            </span>
            {source && (
              <span className="meta-item">
                <ShieldCheck size={15} />
                Source: {source}
              </span>
            )}
            {lastUpdated && (
              <span className="meta-item">
                <Calendar size={15} />
                Updated: {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="scheme-modal-body">
          {/* Description */}
          <section className="scheme-section">
            <h3 className="section-heading">
              <Info size={18} />
              About the Scheme
            </h3>
            <p className="scheme-body-description">{description}</p>
          </section>

          {/* Benefits */}
          <section className="scheme-section">
            <h3 className="section-heading">
              <Award size={18} />
              Benefits
            </h3>
            {benefits && benefits.length > 0 ? (
              <ul className="scheme-benefits-list">
                {benefits.map((benefit, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="benefit-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-info-text">Benefits information not available.</p>
            )}
          </section>

          {/* Eligibility */}
          <section className="scheme-section">
            <h3 className="section-heading">
              <ShieldCheck size={18} />
              Eligibility Criteria
            </h3>
            {eligibility && eligibility.length > 0 ? (
              <ul className="scheme-bullets-list">
                {eligibility.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="no-info-text">Eligibility information not available.</p>
            )}
          </section>

          {/* Required Documents */}
          <section className="scheme-section">
            <h3 className="section-heading">
              <FileText size={18} />
              Required Documents
            </h3>
            {requiredDocuments && requiredDocuments.length > 0 ? (
              <ul className="scheme-documents-list">
                {requiredDocuments.map((doc, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="doc-icon" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-info-text">Required documents information not available.</p>
            )}
          </section>

          {/* Application Process */}
          <section className="scheme-section">
            <h3 className="section-heading">
              <ListOrdered size={18} />
              How to Apply
            </h3>
            {applicationProcess && applicationProcess.length > 0 ? (
              <ol className="scheme-steps-list">
                {applicationProcess.map((step, idx) => (
                  <li key={idx}>
                    <span className="step-number">{idx + 1}</span>
                    <span className="step-content">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="no-info-text">Application process information not available.</p>
            )}
          </section>

          {/* Contact & Official Links */}
          {(officialUrl || informationUrl || helpline) && (
            <section className="scheme-section links-section">
              <h3 className="section-heading">
                <HelpCircle size={18} />
                Official Resources & Contact
              </h3>
              
              <div className="links-grid">
                {officialUrl && (
                  <a
                    href={officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="official-link-btn primary"
                  >
                    <span>Official Website</span>
                    <ExternalLink size={16} />
                  </a>
                )}

                {informationUrl && (
                  <a
                    href={informationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="official-link-btn secondary"
                  >
                    <span>More Information</span>
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>

              {helpline && (
                <div className="helpline-box">
                  <Phone size={18} className="helpline-icon" />
                  <div>
                    <span className="helpline-label">Helpline Number</span>
                    <span className="helpline-number">{helpline}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Farmio AI Assistant Banner */}
          <div className="ai-help-banner">
            <div className="ai-help-content">
              <div className="ai-help-icon-wrapper">
                <Bot size={22} />
              </div>
              <div>
                <h4>Don't understand this scheme?</h4>
                <p>Ask Farmio AI to explain the eligibility, benefits, and steps in simple language.</p>
              </div>
            </div>
            <Link to="/ai" className="ask-ai-btn">
              Ask Farmio AI
            </Link>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="scheme-modal-footer">
          <button className="modal-close-action-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailsModal;
