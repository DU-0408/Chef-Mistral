/**
 * Centralized API client for the Chef-Qwen backend.
 * All backend communication goes through these functions.
 * In production, NEXT_PUBLIC_API_URL is unset so requests go to same-origin
 * and get proxied by Next.js rewrites to the backend service.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Register a new user with email and password.
 */
export async function register(username, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message =
      data.detail?.password_errors?.join(". ") ||
      data.detail ||
      "Registration failed";
    throw new Error(message);
  }

  return data;
}

/**
 * Log in with email and password.
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

/**
 * Get the Google OAuth redirect URL.
 */
export function getGoogleAuthUrl() {
  return `${API_BASE}/api/auth/google`;
}

/**
 * Get the currently authenticated user's profile.
 */
export async function getMe(token) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
}

/**
 * Generate a recipe from the given ingredients.
 */
export async function generateRecipe(token, ingredients) {
  const res = await fetch(`${API_BASE}/api/recipe/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ingredients }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to generate recipe");
  }

  return data;
}
