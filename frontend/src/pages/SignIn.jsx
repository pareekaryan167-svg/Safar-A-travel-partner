import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import api from "../services/api";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import "./SignIn.css";

function SignIn() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const { name, email, phone } = formData;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setLoading(true);

      const data = await api.sendOTP(
        name.trim(),
        email.trim(),
        phone.trim()
      );

      setMessage(data.message || "OTP sent successfully!");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const data = await api.verifyOTP(formData.email, otp);

      if (!data.token) {
        throw new Error("Login failed. No authentication token received.");
      }

      login(data.token);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
    setError("");
    setMessage("");
  };

  const handleResendOTP = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const data = await api.sendOTP(
        formData.name.trim(),
        formData.email.trim(),
        formData.phone.trim()
      );

      setMessage(data.message || "A new OTP has been sent.");
      setOtp("");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page" id="signin-page">
      <Navbar />

      <div className="signin-bg">
        <video autoPlay muted loop playsInline className="signin-video">
          <source src="/SignIn.mp4" type="video/mp4" />
        </video>

        <div className="signin-overlay" />
      </div>

      <div className="signin-content">
        <div className="signin-card animate-scale-in">

          <div className="signin-brand">
            <span className="signin-icon">✈️</span>

            <h1>Welcome to Safar</h1>

            <p>
              {step === 1
                ? "Sign in to plan your perfect trip"
                : "Verify your email to continue"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP}>

              <div className="signin-form-group">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="signin-form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="signin-form-group">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>

              {error && (
                <div className="signin-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="signin-success">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="otp-btn"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>

              <div className="otp-info">
                <p>We've sent a 6-digit OTP to</p>

                <strong>{formData.email}</strong>
              </div>

              <div className="signin-form-group">
                <label htmlFor="otp">Enter OTP</label>

                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOtp(value);
                    setError("");
                  }}
                  maxLength={6}
                  disabled={loading}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              {error && (
                <div className="signin-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="signin-success">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="otp-btn"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="otp-actions">

                <button
                  type="button"
                  className="back-btn"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <FaArrowLeft />
                  Change details
                </button>

                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>

              </div>
            </form>
          )}

          <div className="signin-divider">
            <span>or</span>
          </div>

          <button
            className="admin-btn btn btn-ghost"
            onClick={() => navigate("/admin/login")}
            id="admin-login-link"
          >
            <FaShieldAlt />
            Admin Login
          </button>

          <p className="signin-terms">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignIn;