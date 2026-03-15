"use client";

import { MiniGameRecipe } from "@/lib/miniGame";

interface IngredientSlotsProps {
  recipe: MiniGameRecipe;
  discovered: string[];
}

export default function IngredientSlots({ recipe, discovered }: IngredientSlotsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {recipe.ingredients.map((ingredient) => {
        const isRevealed = discovered.includes(ingredient.name);
        return (
          <div
            key={ingredient.name}
            className="flex flex-col items-center gap-1 w-16"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              {isRevealed ? (
                <img
                  src={ingredient.imageUrl}
                  alt={ingredient.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-500">?</span>
              )}
            </div>
            {isRevealed && (
              <span className="text-xs text-center font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
                {ingredient.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
