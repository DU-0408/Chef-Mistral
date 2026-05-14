"use client";

/**
 * Landing Page — scrollable marketing page with Hero, How It Works, Features, and Footer.
 */

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="landing">
      <Navbar />

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-badge">✨ Powered by Qwen AI</div>
        <h1>
          Your AI-Powered
          <br />
          <span className="accent">Chef Companion</span>
        </h1>
        <p className="hero-subtitle">
          Tell us what ingredients you have, and our AI chef will craft a
          delicious recipe just for you — instantly.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Log In
          </Link>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="section" id="how-it-works" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Three simple steps to dinner</h2>
        </div>
        <div className="steps-grid">
          <div className="card step-card">
            <div className="step-number">1</div>
            <h3>Add Your Ingredients</h3>
            <p>
              Type in what you have on hand — from pantry staples to that
              mystery veggie in your fridge.
            </p>
          </div>
          <div className="card step-card">
            <div className="step-number">2</div>
            <h3>AI Magic Happens</h3>
            <p>
              Our Qwen AI analyzes your ingredients and creates a
              personalized recipe tailored to what you have.
            </p>
          </div>
          <div className="card step-card">
            <div className="step-number">3</div>
            <h3>Cook & Enjoy</h3>
            <p>
              Follow the step-by-step recipe, impress your taste buds, and
              never waste food again.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">Why Chef Qwen?</h2>
        </div>
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Smart AI Recipes</h3>
            <p>
              Powered by Qwen AI to generate creative, practical recipes
              from whatever you have available.
            </p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Results</h3>
            <p>
              Get a complete recipe with instructions in seconds — no
              searching through hundreds of websites.
            </p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">🥗</div>
            <h3>Reduce Food Waste</h3>
            <p>
              Use up ingredients before they expire. Our AI adapts to
              whatever combination you provide.
            </p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>
              Your data stays safe with JWT authentication and server-side
              AI processing — no API keys exposed.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section
        className="section"
        style={{
          background: "var(--color-bg-secondary)",
          textAlign: "center",
        }}
      >
        <h2
          className="section-title"
          style={{ marginBottom: "var(--space-4)" }}
        >
          Ready to cook something amazing?
        </h2>
        <p
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-8)",
            fontSize: "var(--font-size-lg)",
          }}
        >
          Join Chef Qwen and turn your ingredients into culinary
          masterpieces.
        </p>
        <Link href="/register" className="btn btn-primary btn-lg">
          Create Free Account
        </Link>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="footer" id="footer">
        <div className="footer-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <Link href="/login">Log In</Link>
          <Link href="/register">Sign Up</Link>
        </div>
        <p>© 2026 Chef Qwen. Built with ❤️ and Qwen AI.</p>
      </footer>
    </div>
  );
}
