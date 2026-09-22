import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Bot,
  ArrowRight,
} from "lucide-react";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res?.success && res?.data) {
        const { accessToken, user } = res.data;
        login(accessToken, user);
        navigate("/dashboard");
      } else {
        setErrorMessage(res?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Sidebar Banner */}
      <div className="auth-sidebar-banner">
        <Link to="/" className="auth-banner-brand">
          <div className="auth-banner-brand-icon">
            <Leaf size={22} color="#fff" />
          </div>
          <span className="auth-banner-brand-name">Farmio</span>
        </Link>

        <div className="auth-banner-content">
          <h1 className="auth-banner-title">
            Welcome back to Farmio
          </h1>
          <p className="auth-banner-desc">
            Continue managing your farm with AI-powered insights, soil health tracking, and real-time weather analytics.
          </p>

          <div className="auth-preview-card">
            <div className="auth-preview-card-icon">
              <Bot size={20} color="#4ade80" />
            </div>
            <div>
              <div className="auth-preview-card-title">AI Farm Copilot</div>
              <div className="auth-preview-card-text">
                Your personalized advice for crop care, pest detection, and yield optimization is ready.
              </div>
            </div>
          </div>
        </div>

        <div className="auth-banner-footer">
          &copy; 2026 Farmio. Smart Agriculture Platform.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <Link to="/" className="auth-back-link" id="login-back-home">
            <ArrowLeft size={16} /> Back to Farmio
          </Link>

          <div className="auth-header">
            <h2 className="auth-title">Sign in to Farmio</h2>
            <p className="auth-subtitle">
              Enter your email and password to access your dashboard.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-alert" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              id="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-note">
            Don&apos;t have an account?{" "}
            <Link to="/register" id="login-goto-register">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
