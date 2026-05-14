"use client";

/**
 * Chef Page — the core recipe generator experience.
 * Protected route: redirects to /login if not authenticated.
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import IngredientsList from "@/components/IngredientsList";
import RecipeDisplay from "@/components/RecipeDisplay";
import { generateRecipe } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChefPage() {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const router = useRouter();
  const { token, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const addIngredient = (e) => {
    e.preventDefault();
    const value = inputRef.current?.value?.trim();
    if (!value) return;

    // Prevent duplicates (case-insensitive)
    if (ingredients.some((i) => i.toLowerCase() === value.toLowerCase())) {
      return;
    }

    setIngredients((prev) => [...prev, value]);
    inputRef.current.value = "";
    inputRef.current.focus();
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetRecipe = async () => {
    setError("");
    setLoading(true);
    setRecipe("");

    try {
      const data = await generateRecipe(token, ingredients);
      setRecipe(data.recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="chef-page">
        <div className="chef-header">
          <h2>What&apos;s in your kitchen?</h2>
          <p>Add at least 4 ingredients and let AI do the cooking magic</p>
        </div>

        {/* Ingredient Input Form */}
        <form className="ingredient-form" onSubmit={addIngredient} id="ingredient-form">
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            placeholder="e.g. oregano, chicken, rice..."
            id="ingredient-input"
          />
          <button type="submit" className="btn btn-primary">
            + Add Ingredient
          </button>
        </form>

        {/* Ingredients List */}
        <IngredientsList
          ingredients={ingredients}
          onRemove={removeIngredient}
        />

        {/* Recipe Prompt — shows when ≥ 4 ingredients */}
        {ingredients.length >= 4 && !recipe && !loading && (
          <div className="recipe-prompt" id="recipe-prompt">
            <div className="recipe-prompt-text">
              <h3>Ready for a recipe?</h3>
              <p>
                You have {ingredients.length} ingredients — let our AI chef
                create something delicious!
              </p>
            </div>
            <button
              onClick={handleGetRecipe}
              className="btn btn-primary btn-lg"
              id="get-recipe-btn"
            >
              Get a Recipe
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">
              Our AI chef is crafting your recipe...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-message" style={{ marginBottom: "var(--space-6)" }}>
            {error}
          </div>
        )}

        {/* Recipe Display */}
        <RecipeDisplay recipe={recipe} />
      </div>
    </>
  );
}
