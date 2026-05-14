"use client";

/**
 * Register Page — user registration with real-time password strength feedback.
 * Includes Google OAuth option.
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register as registerApi, getGoogleAuthUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { loginWithToken, isAuthenticated, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/chef");
    }
  }, [isAuthenticated, loading, router]);

  // Real-time password validation
  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  }), [password]);

  const allChecksPassed = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!allChecksPassed) {
      setError("Please meet all password requirements");
      return;
    }

    setSubmitting(true);

    try {
      const data = await registerApi(username, email, password);
      loginWithToken(data.access_token, data.user);
      router.push("/chef");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create account</h2>
            <p>Start generating AI-powered recipes</p>
          </div>

          {/* Google OAuth Button */}
          <a href={getGoogleAuthUrl()} className="btn btn-google">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </a>

          <div className="auth-divider">or</div>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input-field"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`input-field ${password && !allChecksPassed ? "input-error" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div className="password-requirements">
                  <span className={`password-req ${passwordChecks.length ? "met" : ""}`}>
                    {passwordChecks.length ? "✓" : "○"} At least 8 characters
                  </span>
                  <span className={`password-req ${passwordChecks.uppercase ? "met" : ""}`}>
                    {passwordChecks.uppercase ? "✓" : "○"} One uppercase letter
                  </span>
                  <span className={`password-req ${passwordChecks.lowercase ? "met" : ""}`}>
                    {passwordChecks.lowercase ? "✓" : "○"} One lowercase letter
                  </span>
                  <span className={`password-req ${passwordChecks.number ? "met" : ""}`}>
                    {passwordChecks.number ? "✓" : "○"} One number
                  </span>
                  <span className={`password-req ${passwordChecks.special ? "met" : ""}`}>
                    {passwordChecks.special ? "✓" : "○"} One special character
                  </span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className={`input-field ${confirmPassword && password !== confirmPassword ? "input-error" : ""}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <span style={{ color: "var(--color-error)", fontSize: "var(--font-size-xs)" }}>
                  Passwords do not match
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || !allChecksPassed}
              style={{ width: "100%" }}
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
