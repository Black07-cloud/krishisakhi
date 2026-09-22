import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Bot,
  Sprout,
  FlaskConical,
  CloudSun,
  Droplets,
  ScanLine,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Landing.css";

const FEATURES = [
  {
    icon: Bot,
    title: "AI Farming Assistant",
    desc: "Get practical guidance for crops, fertilizer, pests, irrigation and everyday farming decisions.",
    bg: "#dcfce7",
    color: "#16a34a",
  },
  {
    icon: Sprout,
    title: "Crop Intelligence",
    desc: "Track crop lifecycle and receive stage-based farming guidance.",
    bg: "#d1fae5",
    color: "#059669",
  },
  {
    icon: FlaskConical,
    title: "Soil Intelligence",
    desc: "Understand soil health, nutrients and crop suitability.",
    bg: "#fef3c7",
    color: "#92400e",
  },
  {
    icon: CloudSun,
    title: "Weather & Irrigation",
    desc: "Use weather conditions to make smarter irrigation decisions and save water.",
    bg: "#dbeafe",
    color: "#2563eb",
  },
  {
    icon: ScanLine,
    title: "Disease Detection",
    desc: "Analyze crop images and identify potential crop diseases.",
    bg: "#fee2e2",
    color: "#dc2626",
  },
  {
    icon: BookOpen,
    title: "Government Schemes",
    desc: "Discover agriculture schemes and understand eligibility and benefits.",
    bg: "#ede9fe",
    color: "#7c3aed",
  },
];

const AI_CHIPS = [
  "Crop Advice",
  "Fertilizer",
  "Irrigation",
  "Soil Health",
  "Disease",
  "Weather",
  "Government Schemes",
];

const STEPS = [
  {
    num: "01",
    title: "Create Your Farm",
    desc: "Add your farm and location details.",
  },
  {
    num: "02",
    title: "Add Your Crops",
    desc: "Tell Farmio what you're growing.",
  },
  {
    num: "03",
    title: "Connect Farm Data",
    desc: "Use soil, weather and crop information.",
  },
  {
    num: "04",
    title: "Get AI-Powered Guidance",
    desc: "Receive intelligent farming recommendations.",
  },
];

const Landing = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const aiLink = user ? "/ai" : "/login";

  return (
    <div className="landing-container">
      {/* ── Header / Navbar ────────────────────────────────────────────── */}
      <header className="landing-navbar">
        <div className="landing-nav-content">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <Leaf size={20} color="#fff" />
            </div>
            <span className="landing-logo-text">Farmio</span>
            <span className="landing-logo-tag">AI</span>
          </Link>

          <nav>
            <ul className="landing-nav-links">
              <li><a href="/">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link to={aiLink}>AI Assistant</Link></li>
            </ul>
          </nav>

          <div className="landing-nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn-nav-register">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-nav-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn-nav-register">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer open">
          <a href="/" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <Link to={aiLink} onClick={() => setMobileMenuOpen(false)}>AI Assistant</Link>
          {user ? (
            <Link to="/dashboard" className="btn-hero-primary" onClick={() => setMobileMenuOpen(false)}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-hero-secondary" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn-hero-primary" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-text-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            Smart Agriculture Platform
          </div>

          <h1 className="hero-title">
            Smart Farming. <br />
            <span>Powered by AI.</span>
          </h1>

          <p className="hero-subtitle">
            Farmio brings AI-powered crop intelligence, soil insights, weather guidance, irrigation support and farm management into one simple platform.
          </p>

          <div className="hero-cta-group">
            {user ? (
              <Link to="/dashboard" className="btn-hero-primary">
                Open Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero-primary">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-hero-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Visual Box */}
        <div className="hero-visual">
          <div className="hero-visual-header">
            <div className="hero-visual-dots">
              <span className="hero-visual-dot dot-red" />
              <span className="hero-visual-dot dot-yellow" />
              <span className="hero-visual-dot dot-green" />
            </div>
            <div className="hero-visual-status">
              <span className="pulse-icon" />
              Farmio Engine Active
            </div>
          </div>

          <div className="hero-visual-grid">
            <div className="hero-chip-card">
              <div className="hero-chip-icon" style={{ background: "rgba(22, 163, 74, 0.2)" }}>
                <Sprout size={18} color="#4ade80" />
              </div>
              <div>
                <div className="hero-chip-title">Crops</div>
                <div className="hero-chip-val">Active Monitoring</div>
              </div>
            </div>

            <div className="hero-chip-card">
              <div className="hero-chip-icon" style={{ background: "rgba(37, 99, 235, 0.2)" }}>
                <CloudSun size={18} color="#60a5fa" />
              </div>
              <div>
                <div className="hero-chip-title">Weather</div>
                <div className="hero-chip-val">Real-time Forecast</div>
              </div>
            </div>

            <div className="hero-chip-card">
              <div className="hero-chip-icon" style={{ background: "rgba(217, 119, 6, 0.2)" }}>
                <FlaskConical size={18} color="#fbbf24" />
              </div>
              <div>
                <div className="hero-chip-title">Soil Health</div>
                <div className="hero-chip-val">Optimal N-P-K</div>
              </div>
            </div>

            <div className="hero-chip-card">
              <div className="hero-chip-icon" style={{ background: "rgba(147, 51, 234, 0.2)" }}>
                <Droplets size={18} color="#c084fc" />
              </div>
              <div>
                <div className="hero-chip-title">Irrigation</div>
                <div className="hero-chip-val">Smart Schedule</div>
              </div>
            </div>

            <div className="hero-ai-banner">
              <Bot size={22} color="#4ade80" />
              <div className="hero-ai-banner-text">
                <p>
                  <strong>AI Insight:</strong> Moisture levels optimal for sowing. Weather forecast clear for 3 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Strip ────────────────────────────────────────────────── */}
      <section className="value-strip-section">
        <div className="value-strip-content">
          <div className="value-item">
            <div className="value-icon-box">
              <Bot size={20} color="#16a34a" />
            </div>
            <div>
              <div className="value-title">AI-Powered</div>
              <div className="value-sub">Intelligent guidance</div>
            </div>
          </div>

          <div className="value-item">
            <div className="value-icon-box">
              <Sprout size={20} color="#16a34a" />
            </div>
            <div>
              <div className="value-title">Smart Agriculture</div>
              <div className="value-sub">Modern farm tools</div>
            </div>
          </div>

          <div className="value-item">
            <div className="value-icon-box">
              <TrendingUp size={20} color="#16a34a" />
            </div>
            <div>
              <div className="value-title">Data-Driven Decisions</div>
              <div className="value-sub">Soil &amp; weather analytics</div>
            </div>
          </div>

          <div className="value-item">
            <div className="value-icon-box">
              <ShieldCheck size={20} color="#16a34a" />
            </div>
            <div>
              <div className="value-title">Farmer-Friendly</div>
              <div className="value-sub">Simple &amp; intuitive UI</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-tag">Capabilities</span>
          <h2 className="section-title">Everything Your Farm Needs</h2>
          <p className="section-subtitle">
            One intelligent platform for smarter farming decisions.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div className="feature-card" key={item.title}>
                <div
                  className="feature-icon-wrapper"
                  style={{ background: item.bg }}
                >
                  <Icon size={26} color={item.color} />
                </div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="feature-card-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AI Section Highlight ───────────────────────────────────────── */}
      <section className="ai-section-wrapper">
        <div className="ai-section-content">
          <div className="ai-section-tag">
            <Bot size={14} />
            Intelligent Copilot
          </div>
          <h2 className="ai-section-title">Meet Your AI Farming Assistant</h2>
          <p className="ai-section-desc">
            Farmio AI helps farmers understand their farm data and get practical guidance for crop, soil, weather, irrigation, disease and government schemes.
          </p>

          <div className="ai-chips-grid">
            {AI_CHIPS.map((chip) => (
              <div className="ai-chip-pill" key={chip}>
                <Sparkles size={14} color="#4ade80" />
                {chip}
              </div>
            ))}
          </div>

          <Link to={aiLink} className="btn-talk-ai">
            <Bot size={18} />
            Talk to Farmio AI
          </Link>
        </div>
      </section>

      {/* ── How Farmio Works ───────────────────────────────────────────── */}
      <section className="how-section" id="how-it-works">
        <div className="section-header">
          <span className="section-tag">Workflow</span>
          <h2 className="section-title">How Farmio Works</h2>
          <p className="section-subtitle">
            Four simple steps to transform your farm management.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <div className="step-card" key={step.num}>
              <div className="step-number">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <h2 className="final-cta-title">
            Make Better Farming Decisions With Farmio
          </h2>
          <p className="final-cta-desc">
            Bring your farm, crop, soil, weather and AI intelligence together in one place.
          </p>
          <Link to="/register" className="btn-cta-white">
            Start Farming Smarter <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="landing-logo-icon">
              <Leaf size={18} color="#fff" />
            </div>
            <div>
              <div className="footer-logo-text">Farmio</div>
              <div className="footer-desc">AI-powered agriculture intelligence.</div>
            </div>
          </div>

          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
          </ul>
        </div>

        <div className="footer-copy">
          &copy; 2026 Farmio. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
