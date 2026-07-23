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

/**
 * Update the user's profile (dietary restrictions).
 */
export async function updateProfile(token, dietary_restrictions) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dietary_restrictions }),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

/**
 * Pantry API
 */
export async function getPantry(token) {
  const res = await fetch(`${API_BASE}/api/pantry`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch pantry");
  return res.json();
}

export async function addPantryItem(token, name) {
  const res = await fetch(`${API_BASE}/api/pantry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to add item to pantry");
  return res.json();
}

export async function removePantryItem(token, id) {
  const res = await fetch(`${API_BASE}/api/pantry/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove item from pantry");
  return res.json();
}

/**
 * Recipes API
 */
export async function getRecipes(token) {
  const res = await fetch(`${API_BASE}/api/recipes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

export async function saveRecipe(token, title, content, image_url = null) {
  const res = await fetch(`${API_BASE}/api/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, image_url }),
  });
  if (!res.ok) throw new Error("Failed to save recipe");
  return res.json();
}

export async function toggleFavoriteRecipe(token, id, is_favorite) {
  const res = await fetch(`${API_BASE}/api/recipes/${id}?is_favorite=${is_favorite}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to update favorite status");
  return res.json();
}

export async function deleteRecipe(token, id) {
  const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete recipe");
  return res.json();
}

/**
 * Image Generation API
 */
export async function generateRecipeImage(token, prompt) {
  const res = await fetch(`${API_BASE}/api/recipe/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to generate image");
  return data;
}
