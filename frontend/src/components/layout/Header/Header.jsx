import { useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./Header.css";

const routeMeta = {
  "/dashboard": { title: "Dashboard", crumb: "Overview" },
  "/farms": { title: "My Farms", crumb: "Farm Management" },
  "/crops": { title: "Crops", crumb: "Farm Management" },
  "/soil": { title: "Soil Health", crumb: "Farm Management" },
  "/weather": { title: "Weather", crumb: "Farm Management" },
  "/irrigation": { title: "Irrigation", crumb: "Farm Management" },
  "/tasks": { title: "Farm Tasks", crumb: "Tools" },
  "/disease": { title: "Disease Detection", crumb: "Tools" },
  "/schemes": { title: "Government Schemes", crumb: "Tools" },
  "/ai": { title: "AI Assistant", crumb: "Powered by Gemini" },
};

const Header = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const meta = routeMeta[pathname] || { title: "Farmio", crumb: "" };
  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : "FA";

  return (
    <header className="header">
      {/* Mobile hamburger */}
      <button
        className="header-menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        id="header-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="header-title-area">
        <h1 className="header-page-title">{meta.title}</h1>
        {meta.crumb && (
          <div className="header-breadcrumb">{meta.crumb}</div>
        )}
      </div>

      {/* Right actions */}
      <div className="header-actions">
        {/* Notification */}
        <button
          className="header-icon-btn"
          aria-label="Notifications"
          id="header-notifications-btn"
        >
          <Bell size={18} />
          <span className="notif-dot" aria-hidden="true" />
        </button>

        {/* Profile */}
        <button
          className="header-profile"
          aria-label="User profile"
          id="header-profile-btn"
        >
          <div className="header-avatar">{initials}</div>
          <span className="header-profile-name">
            {user?.name || "Farmer"}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
