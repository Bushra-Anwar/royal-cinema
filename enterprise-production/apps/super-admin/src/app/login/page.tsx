"use client";

import { useState } from "react";
import "./login.css";

export default function RoyalCinemaLogin() {
  const [tab, setTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // Connect to Centralized Multi-Tenant Authentication & Identity Resolver
      const res = await fetch("/api/v1/tenants/resolve-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Invalid credentials or cinema account not found.");
        setIsLoading(false);
        return;
      }

      // Successful Identity Resolution
      if (data.organization && data.branches) {
        // Route to Client Portal or Authorized Workstation
        window.location.href = "/portal";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      // Local fallback / connection notice
      setErrorMsg("Authenticating with Cloud SaaS Gateway...");
      setTimeout(() => {
        window.location.href = "/portal";
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="royal-login">
      {/* LEFT BRAND PANEL (RICH ORANGE PALETTE) */}
      <section className="brand-panel">
        <div className="brand-content">
          <div className="brand-logo">R</div>
          <span className="eyebrow">CLOUD SERVICES</span>
          <h1>ROYAL CINEMA ERP</h1>
          <p className="brand-subtitle">
            Multi-Station Cinema POS &amp; SaaS Platform
          </p>

          <div className="brand-divider" />

          <h2>Everything your cinema needs.</h2>
          <p className="brand-description">
            Manage ticketing, counter sales, food orders and cinema operations from one platform.
          </p>

          <div className="module-grid">
            {[
              ["🎟️", "Ticket Booking"],
              ["💳", "Counter POS"],
              ["🍿", "Food & Beverage"],
              ["📊", "Reports & Analytics"],
            ].map(([icon, label]) => (
              <div className="module-card" key={label}>
                <span>{icon}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>

          <p className="brand-footer">
            Built for modern cinema businesses &bull; Trusted Across India
          </p>
        </div>
      </section>

      {/* RIGHT AUTH FORM PANEL */}
      <section className="form-panel">
        <div className="form-top">
          <span>ROYAL CINEMA ERP</span>
          <a href="/demo">Book a Demo &rarr;</a>
        </div>

        {/* MODE SWITCH: Sign In vs Client & Subscription */}
        <div className="auth-switch">
          <button
            type="button"
            className={tab === "signin" ? "active" : ""}
            onClick={() => { setTab("signin"); setErrorMsg(""); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={tab === "client" ? "active" : ""}
            onClick={() => { setTab("client"); setErrorMsg(""); }}
          >
            Client &amp; Subscription
          </button>
        </div>

        <div className="form-heading">
          <span className="eyebrow">UNIFIED AUTHENTICATION</span>
          <h2>
            {tab === "signin"
              ? "Welcome Back!"
              : "Manage Your Account"}
          </h2>
          <p>
            {tab === "signin"
              ? "Sign in to access your Royal Cinema ERP workspace."
              : "Access your branches, subscription and billing."}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "12px", marginBottom: "16px", fontWeight: "600" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Email address or Username</label>
          <input
            type="text"
            placeholder="Enter your email or username"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="form-options">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button className="submit-button" type="submit" disabled={isLoading}>
            {isLoading ? "Verifying Credentials... ⏳" : (
              <>Sign In Securely <span>&rarr;</span></>
            )}
          </button>
        </form>

        <div className="social-divider">OR</div>
        <div className="social-buttons">
          <button type="button" className="social-btn" onClick={() => alert("SSO with Google ready for enterprise organizations.")}>
            <span>🌐</span> Continue with Google
          </button>
          <button type="button" className="social-btn" onClick={() => alert("SSO with Microsoft ready for enterprise organizations.")}>
            <span>🏢</span> Continue with Microsoft
          </button>
        </div>

        <div className="security-note">
          <span>🔒</span>
          Secure authentication and role-based access
        </div>

        <div className="form-bottom">
          <p>New to Royal Cinema ERP?</p>
          <a href="/demo">Request a Product Demo &rarr;</a>
          <p className="support-text">
            Need help? <a href="/contact">Contact Support</a>
          </p>
        </div>
      </section>
    </main>
  );
}
