import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Sprout,
  ArrowRight,
} from "lucide-react";
import { registerUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    language: "ta", // Backend schema enum: ["ta", "en", "ml"]
    state: "",
    district: "",
    village: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const validate = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return "Full Name must be at least 2 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!formData.password || formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Password and Confirm Password do not match.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        language: formData.language,
        location: {
          state: formData.state.trim() || undefined,
          district: formData.district.trim() || undefined,
          village: formData.village.trim() || undefined,
        },
      };

      const res = await registerUser(payload);

      if (res?.success && res?.data) {
        const { accessToken, user } = res.data;
        login(accessToken, user);
        navigate("/dashboard");
      } else {
        setErrorMessage(res?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "Failed to create account. Email may already be registered.";
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
            Join Farmio Today
          </h1>
          <p className="auth-banner-desc">
            Start managing your farm with intelligent agriculture tools, AI crop guidance, and automated task planning.
          </p>

          <div className="auth-preview-card">
            <div className="auth-preview-card-icon">
              <Sprout size={20} color="#4ade80" />
            </div>
            <div>
              <div className="auth-preview-card-title">Empowering Every Farmer</div>
              <div className="auth-preview-card-text">
                Connect your farm, receive soil health reports, and maximize crop yield with smart recommendations.
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
        <div className="auth-card" style={{ maxWidth: "480px" }}>
          <Link to="/" className="auth-back-link" id="register-back-home">
            <ArrowLeft size={16} /> Back to Farmio
          </Link>

          <div className="auth-header">
            <h2 className="auth-title">Create your Farmio account</h2>
            <p className="auth-subtitle">
              Start managing your farm with intelligent agriculture tools.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-alert" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Name & Phone */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name *
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email & Language */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-language">
                  Preferred Language *
                </label>
                <select
                  id="reg-language"
                  name="language"
                  className="form-input"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="en">English</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password *
                </label>
                <div className="input-wrapper">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
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

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirmPassword">
                  Confirm Password *
                </label>
                <input
                  id="reg-confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Location (State, District, Village) */}
            <div className="form-section-heading">Farm Location Details (Optional)</div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-state">
                  State
                </label>
                <input
                  id="reg-state"
                  name="state"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tamil Nadu"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-district">
                  District
                </label>
                <input
                  id="reg-district"
                  name="district"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Coimbatore"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-village">
                  Village / City
                </label>
                <input
                  id="reg-village"
                  name="village"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pollachi"
                  value={formData.village}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              id="register-submit-btn"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-note">
            Already have an account?{" "}
            <Link to="/login" id="register-goto-login">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
