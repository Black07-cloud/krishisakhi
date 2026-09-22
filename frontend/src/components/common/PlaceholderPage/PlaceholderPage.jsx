import { Link } from "react-router-dom";
import "./PlaceholderPage.css";

/**
 * Reusable "coming soon" placeholder for module pages
 * that haven't been fully built yet.
 */
const PlaceholderPage = ({
  icon: Icon,
  title,
  description,
  color = "#16a34a",
  bg = "#dcfce7",
  actions = [],
}) => (
  <div className="placeholder-page">
    <div className="placeholder-icon" style={{ background: bg }}>
      <Icon size={36} color={color} />
    </div>
    <h2 className="placeholder-title">{title}</h2>
    <p className="placeholder-desc">{description}</p>
    {actions.length > 0 && (
      <div className="placeholder-actions">
        {actions.map((action) =>
          action.to ? (
            <Link key={action.label} to={action.to} className="btn btn-primary" id={`placeholder-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}>
              {action.label}
            </Link>
          ) : (
            <button key={action.label} className="btn btn-outline" disabled>
              {action.label} — Coming Soon
            </button>
          )
        )}
      </div>
    )}
  </div>
);

export default PlaceholderPage;
