import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  FlaskConical,
  CloudSun,
  Droplets,
  ClipboardList,
  ScanLine,
  BookOpen,
  Bot,
  Leaf,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  {
    section: "Overview",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    section: "Farm Management",
    items: [
      { to: "/farms", icon: MapPin, label: "My Farms" },
      { to: "/crops", icon: Sprout, label: "Crops" },
      { to: "/soil", icon: FlaskConical, label: "Soil Health" },
      { to: "/weather", icon: CloudSun, label: "Weather" },
      { to: "/irrigation", icon: Droplets, label: "Irrigation" },
    ],
  },
  {
    section: "Tools",
    items: [
      { to: "/tasks", icon: ClipboardList, label: "Farm Tasks" },
      { to: "/disease", icon: ScanLine, label: "Disease Detection" },
      { to: "/schemes", icon: BookOpen, label: "Govt. Schemes" },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : "FA";

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`} aria-label="Main navigation">
        {/* Brand */}
        <Link to="/dashboard" className="sidebar-brand" onClick={onClose}>
          <div className="sidebar-brand-icon">
            <Leaf size={20} color="#fff" />
          </div>
          <div>
            <div className="sidebar-brand-name">Farmio</div>
          </div>
          <span className="sidebar-brand-tag">Beta</span>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div key={group.section}>
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? " active" : ""}`
                  }
                  onClick={onClose}
                >
                  <Icon className="nav-icon" size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}

          {/* AI Assistant — visually distinct */}
          <div className="sidebar-section-label">AI</div>
          <NavLink
            to="/ai"
            className={({ isActive }) =>
              `sidebar-nav-item ai-item${isActive ? " active" : ""}`
            }
            onClick={onClose}
          >
            <Bot className="nav-icon" size={18} />
            AI Assistant
            <span className="ai-badge">NEW</span>
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Sign out">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.name || "Farmer"}
              </div>
              <div className="sidebar-user-role">
                {user?.email || "Tap to sign out"}
              </div>
            </div>
            <LogOut size={15} color="var(--sidebar-text)" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
