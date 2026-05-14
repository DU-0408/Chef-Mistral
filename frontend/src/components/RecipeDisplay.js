"use client";

/**
 * RecipeDisplay — renders AI-generated recipe markdown in a styled container.
 */

import ReactMarkdown from "react-markdown";

export default function RecipeDisplay({ recipe }) {
  if (!recipe) return null;

  return (
    <section className="recipe-container" id="recipe-display">
      <ReactMarkdown>{recipe}</ReactMarkdown>
    </section>
  );
}
