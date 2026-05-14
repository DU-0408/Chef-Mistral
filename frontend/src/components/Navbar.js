"use client";

/**
 * Navbar component — sticky top navigation.
 * Shows Login/Register when unauthenticated, user info + Logout when authenticated.
 */

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();

  return (
    <nav className="navbar" id="navbar">
      <Link href="/" className="navbar-brand">
        <Image
          src="/chef-mistral-icon.png"
          alt="Chef Qwen"
          width={40}
          height={48}
          priority
        />
        <h1>Chef Qwen</h1>
      </Link>

      <div className="navbar-links">
        {loading ? null : isAuthenticated ? (
          <>
            <Link href="/chef" className="btn btn-ghost">
              🍳 Chef
            </Link>
            <span className="navbar-user">
              {user?.username}
            </span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
