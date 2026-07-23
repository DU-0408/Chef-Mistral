"use client";

/**
 * IngredientsList — renders ingredient chips with Material Symbol close icons.
 */

export default function IngredientsList({ ingredients, onRemove }) {
  if (!ingredients.length) return null;

  return (
    <div className="flex flex-wrap gap-2" id="ingredients-list">
      {ingredients.map((ingredient, index) => (
        <span
          className="inline-flex items-center gap-1 bg-surface-container-low border border-outline-variant px-3 py-1 rounded-DEFAULT font-mono-label text-mono-label text-on-surface"
          key={`${index}-${ingredient}`}
        >
          {ingredient}
          <button
            onClick={() => onRemove(index)}
            aria-label={`Remove ${ingredient}`}
            title={`Remove ${ingredient}`}
            className="hover:text-error transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </span>
      ))}
    </div>
  );
}
