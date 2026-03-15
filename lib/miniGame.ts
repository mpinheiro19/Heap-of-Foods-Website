export type RecipeCategory = 'cookpot' | 'warly' | 'keg' | 'jar' | 'seasonal';

export interface MiniGameIngredient {
  name: string;
  imageUrl: string;
}

export interface MiniGameRecipe {
  name: string;
  imageUrl: string;
  category: RecipeCategory;
  ingredients: MiniGameIngredient[];
}

export interface GameState {
  phase: 'category-select' | 'playing' | 'victory';
  recipe: MiniGameRecipe | null;
  discovered: string[];
  streak: number;
  bestStreak: number;
}

// Raw recipe shape from JSON files
interface RawRecipeItem {
  name: string;
  requires?: { items: string[] }[];
  card_def?: { items: string[] }[];
}

// Raw ingredient shape from ingredients.json
interface RawIngredient {
  name: string;
}

/**
 * Returns recipes where every ingredient in `card_def[].items` resolves
 * to a real ingredient (no tag_ wildcards like MEAT, FISH, etc.).
 */
export function getEligibleRecipes(
  category: RecipeCategory,
  allRecipes: RawRecipeItem[],
  allIngredients: RawIngredient[],
  getImageUrl: (category: RecipeCategory, recipeName: string) => string,
  getIngredientImageUrl: (ingredientName: string) => string,
): MiniGameRecipe[] {
  const ingredientNames = new Set(allIngredients.map((i) => i.name));

  return allRecipes.flatMap((recipe): MiniGameRecipe[] => {
    // Use card_def as the source of concrete ingredient lists; fall back to requires
    const defSlots = recipe.card_def ?? recipe.requires ?? [];
    const ingredientSet = new Set<string>();

    for (const slot of defSlots) {
      for (const item of slot.items) {
        // Skip tag wildcards (they start with "tag_" or are all-uppercase cook-type names)
        if (item.startsWith('tag_')) continue;
        if (!ingredientNames.has(item)) continue;
        ingredientSet.add(item);
      }
    }

    // A recipe needs at least 1 concrete ingredient to be eligible
    if (ingredientSet.size === 0) return [];

    return [
      {
        name: recipe.name,
        imageUrl: getImageUrl(category, recipe.name),
        category,
        ingredients: Array.from(ingredientSet).map((name) => ({
          name,
          imageUrl: getIngredientImageUrl(name),
        })),
      },
    ];
  });
}

export function pickRandomRecipe(pool: MiniGameRecipe[]): MiniGameRecipe {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getBestStreak(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('mini-game-best-streak');
  if (stored === null) return 0;
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function saveBestStreak(n: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mini-game-best-streak', String(n));
}
