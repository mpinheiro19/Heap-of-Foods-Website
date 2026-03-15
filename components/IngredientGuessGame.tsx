"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { getAssetPath } from "@/lib/paths";
import {
  RecipeCategory,
  MiniGameRecipe,
  GameState,
  getEligibleRecipes,
  pickRandomRecipe,
  getBestStreak,
  saveBestStreak,
} from "@/lib/miniGame";
import { ClientOnly } from "@/components/ClientOnly";
import CategorySelector from "@/components/CategorySelector";
import IngredientGrid from "@/components/IngredientGrid";
import IngredientSlots from "@/components/IngredientSlots";
import StreakDisplay from "@/components/StreakDisplay";

// Static imports of all recipe/ingredient data
import cookpotRecipes from "@/data/recipes_cookpot.json";
import warlyRecipes from "@/data/recipes_cookpot_warly.json";
import kegRecipes from "@/data/recipes_cookpot_keg.json";
import jarRecipes from "@/data/recipes_cookpot_jar.json";
import seasonalRecipes from "@/data/recipes_cookpot_seasonal.json";
import allIngredientsData from "@/data/ingredients.json";

const RECIPE_DATA: Record<RecipeCategory, any[]> = {
  cookpot: cookpotRecipes,
  warly: warlyRecipes,
  keg: kegRecipes,
  jar: jarRecipes,
  seasonal: seasonalRecipes,
};

const CATEGORY_IMAGE_FOLDER: Record<RecipeCategory, string> = {
  cookpot: "foods_cookpot",
  warly: "foods_cookpot_warly",
  keg: "foods_cookpot_keg",
  jar: "foods_cookpot_jar",
  seasonal: "foods_cookpot_seasonal",
};

function getRecipeImageUrl(category: RecipeCategory, recipeName: string): string {
  return getAssetPath(`/${CATEGORY_IMAGE_FOLDER[category]}/${recipeName}.png`);
}

function getIngredientImageUrl(ingredientName: string): string {
  return getAssetPath(`/icons/ingredients/ingredient_${ingredientName}.png`);
}

function buildPool(category: RecipeCategory): MiniGameRecipe[] {
  return getEligibleRecipes(
    category,
    RECIPE_DATA[category],
    allIngredientsData,
    getRecipeImageUrl,
    getIngredientImageUrl,
  );
}

const INITIAL_STATE: GameState = {
  phase: "category-select",
  recipe: null,
  discovered: [],
  streak: 0,
  bestStreak: 0,
};

export default function IngredientGuessGame() {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [wrongFlash, setWrongFlash] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState<RecipeCategory | null>(null);

  // Load bestStreak from localStorage on mount
  useEffect(() => {
    const best = getBestStreak();
    setGameState((prev) => ({ ...prev, bestStreak: best }));
  }, []);

  const startGame = useCallback((category: RecipeCategory) => {
    const pool = buildPool(category);
    if (pool.length === 0) return;
    const recipe = pickRandomRecipe(pool);
    setCurrentCategory(category);
    setGameState((prev) => ({
      ...prev,
      phase: "playing",
      recipe,
      discovered: [],
    }));
    setWrongFlash(new Set());
  }, []);

  const handleCategorySelect = useCallback(
    (category: RecipeCategory) => {
      startGame(category);
    },
    [startGame]
  );

  const handleGuess = useCallback(
    (ingredientName: string) => {
      setGameState((prev) => {
        if (!prev.recipe) return prev;
        const isCorrect = prev.recipe.ingredients.some(
          (i) => i.name === ingredientName
        );

        if (isCorrect && !prev.discovered.includes(ingredientName)) {
          const newDiscovered = [...prev.discovered, ingredientName];
          const newStreak = prev.streak + 1;
          const newBest = Math.max(newStreak, prev.bestStreak);
          if (newBest > prev.bestStreak) {
            saveBestStreak(newBest);
          }
          const allFound =
            newDiscovered.length === prev.recipe.ingredients.length;
          return {
            ...prev,
            discovered: newDiscovered,
            streak: newStreak,
            bestStreak: newBest,
            phase: allFound ? "victory" : "playing",
          };
        }

        // Wrong guess
        setWrongFlash((wf) => new Set([...wf, ingredientName]));
        setTimeout(() => {
          setWrongFlash((wf) => {
            const next = new Set(wf);
            next.delete(ingredientName);
            return next;
          });
        }, 800);

        return { ...prev, streak: 0 };
      });
    },
    []
  );

  const handlePlayAgain = useCallback(() => {
    if (currentCategory) startGame(currentCategory);
  }, [currentCategory, startGame]);

  const handleNewCategory = useCallback(() => {
    setCurrentCategory(null);
    setGameState((prev) => ({
      ...prev,
      phase: "category-select",
      recipe: null,
      discovered: [],
    }));
    setWrongFlash(new Set());
  }, []);

  // Build the full ingredient list for the grid (all real ingredients)
  const gridIngredients = allIngredientsData.map((ing) => ({
    name: ing.name,
    imageUrl: getIngredientImageUrl(ing.name),
  }));

  return (
    <ClientOnly>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* TITLE */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {t("miniGame.title")}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {t("miniGame.subtitle")}
          </p>
        </div>

        {/* PHASE: CATEGORY SELECT */}
        {gameState.phase === "category-select" && (
          <CategorySelector onSelect={handleCategorySelect} />
        )}

        {/* PHASE: PLAYING */}
        {gameState.phase === "playing" && gameState.recipe && (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
            {/* LEFT PANEL: recipe info + slots + streak */}
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm w-full">
                <img
                  src={gameState.recipe.imageUrl}
                  alt="?"
                  className="w-28 h-28 object-contain"
                  style={{ filter: "brightness(0) saturate(100%) invert(0%)" }}
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
                  {t("miniGame.ingredientsNeeded", {
                    found: gameState.discovered.length,
                    total: gameState.recipe.ingredients.length,
                  })}
                </p>
                <IngredientSlots
                  recipe={gameState.recipe}
                  discovered={gameState.discovered}
                />
              </div>
              <StreakDisplay
                streak={gameState.streak}
                bestStreak={gameState.bestStreak}
              />
            </div>

            {/* RIGHT PANEL: ingredient grid */}
            <div className="md:h-[60vh] md:overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 shadow-sm p-4">
              <IngredientGridWithFlash
                ingredients={gridIngredients}
                discovered={gameState.discovered}
                wrongFlash={wrongFlash}
                onGuess={handleGuess}
              />
            </div>
          </div>
        )}

        {/* PHASE: VICTORY */}
        {gameState.phase === "victory" && gameState.recipe && (
          <div className="flex flex-col items-center gap-6 py-10 text-center">
            <img
              src={gameState.recipe.imageUrl}
              alt={gameState.recipe.name}
              className="w-32 h-32 object-contain"
            />
            <h2 className="text-2xl font-bold text-green-500">
              {t("miniGame.victory.message")}
            </h2>
            <StreakDisplay
              streak={gameState.streak}
              bestStreak={gameState.bestStreak}
            />
            <div className="flex gap-4">
              <button
                onClick={handlePlayAgain}
                className="px-6 py-3 rounded-xl bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition cursor-pointer"
              >
                {t("miniGame.victory.playAgain")}
              </button>
              <button
                onClick={handleNewCategory}
                className="px-6 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                {t("miniGame.victory.newCategory")}
              </button>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}

// Inner component to wire wrongFlash into IngredientGrid cleanly
function IngredientGridWithFlash({
  ingredients,
  discovered,
  wrongFlash,
  onGuess,
}: {
  ingredients: { name: string; imageUrl: string }[];
  discovered: string[];
  wrongFlash: Set<string>;
  onGuess: (name: string) => void;
}) {
  const { t } = useTranslation();

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
              onClick={() => {
                if (!isDiscovered && !isWrong) onGuess(ingredient.name);
              }}
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
