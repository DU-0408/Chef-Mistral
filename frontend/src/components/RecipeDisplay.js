"use client";

/**
 * RecipeDisplay — renders AI-generated recipe markdown in a clean styled container.
 */

import ReactMarkdown from "react-markdown";

export default function RecipeDisplay({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="recipe-markdown" id="recipe-display">
      <ReactMarkdown>{recipe}</ReactMarkdown>
    </div>
  );
}
