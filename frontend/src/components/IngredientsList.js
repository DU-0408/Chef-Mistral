"use client";

/**
 * IngredientsList — renders ingredient chips with delete buttons.
 * Uses index + ingredient name as unique key (fixing original project's broken key bug).
 */

export default function IngredientsList({ ingredients, onRemove }) {
  if (!ingredients.length) return null;

  return (
    <section className="ingredients-section" id="ingredients-list">
      <h3>Ingredients on hand:</h3>
      <div className="ingredients-chips">
        {ingredients.map((ingredient, index) => (
          <span className="ingredient-chip" key={`${index}-${ingredient}`}>
            {ingredient}
            <button
              onClick={() => onRemove(index)}
              aria-label={`Remove ${ingredient}`}
              title={`Remove ${ingredient}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
