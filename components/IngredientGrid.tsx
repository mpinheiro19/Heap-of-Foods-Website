"use client";

import { useState, useCallback } from "react";
import { MiniGameIngredient } from "@/lib/miniGame";
import { useTranslation } from "@/lib/i18n";

interface IngredientGridProps {
  ingredients: MiniGameIngredient[];
  discovered: string[];
  onGuess: (name: string) => void;
}

export default function IngredientGrid({
  ingredients,
  discovered,
  onGuess,
}: IngredientGridProps) {
  const { t } = useTranslation();
  const [wrongFlash, setWrongFlash] = useState<Set<string>>(new Set());

  const handleGuess = useCallback(
    (name: string) => {
      if (discovered.includes(name) || wrongFlash.has(name)) return;
      onGuess(name);
      // The parent decides whether it was correct; we detect wrong by checking
      // that discovered didn't gain this item — but we can't do that synchronously.
      // Instead, we expose a triggerWrong mechanism via a ref pattern if needed.
      // For now, the wrong flash is triggered externally by IngredientGuessGame.
    },
    [discovered, wrongFlash, onGuess]
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {t("miniGame.guessIngredient")}
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {ingredients.map((ingredient) => {
          const isDiscovered = discovered.includes(ingredient.name);
          const isWrong = wrongFlash.has(ingredient.name);

          return (
            <button
              key={ingredient.name}
              onClick={() => handleGuess(ingredient.name)}
              disabled={isDiscovered}
              title={ingredient.name}
              className={[
                "relative flex flex-col items-center gap-1 p-1 rounded-xl transition cursor-pointer select-none",
                isDiscovered
                  ? "opacity-40 cursor-not-allowed"
                  : isWrong
                  ? "ring-2 ring-red-500 animate-pulse bg-red-100 dark:bg-red-900"
                  : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700",
              ].join(" ")}
            >
              <img
                src={ingredient.imageUrl}
                alt={ingredient.name}
                className="w-10 h-10 object-contain"
                loading="lazy"
              />
              {isDiscovered && (
                <span className="absolute inset-0 flex items-center justify-center text-green-500 text-xl font-bold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Utility: the parent creates a ref to this and calls triggerWrong externally.
// We export a helper that IngredientGuessGame can call to flash wrong cards.
export function useWrongFlash() {
  const [wrongFlash, setWrongFlash] = useState<Set<string>>(new Set());

  const triggerWrong = useCallback((name: string) => {
    setWrongFlash((prev) => new Set([...prev, name]));
    setTimeout(() => {
      setWrongFlash((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }, 800);
  }, []);

  return { wrongFlash, triggerWrong };
}
