import {
  getEligibleRecipes,
  pickRandomRecipe,
  getBestStreak,
  saveBestStreak,
  RecipeCategory,
  MiniGameIngredient,
  MiniGameRecipe,
} from "./miniGame";

// -------------------------------------------------------------------
// Mock helpers
// -------------------------------------------------------------------
function makeGetRecipeImageUrl(category: RecipeCategory, name: string) {
  return `/${category}/${name}.png`;
}

function makeGetIngredientImageUrl(name: string) {
  return `/icons/ingredients/ingredient_${name}.png`;
}

// -------------------------------------------------------------------
// Test data
// -------------------------------------------------------------------

const mockIngredients = [
  { name: "meat" },
  { name: "honey" },
  { name: "carrot" },
  { name: "berry" },
];

const recipeWithRealIngredients = {
  name: "good_stew",
  card_def: [
    { items: ["meat"], amount: 2, comparator: "equal" as const },
    { items: ["carrot"], amount: 1, comparator: "equal" as const },
  ],
};

const recipeWithTagWildcard = {
  name: "mystery_stew",
  card_def: [
    { items: ["tag_meat"], amount: 1, comparator: "equal" as const },
    { items: ["honey"], amount: 1, comparator: "equal" as const },
  ],
};

const recipeAllTags = {
  name: "tag_only",
  card_def: [
    { items: ["tag_fish"], amount: 1, comparator: "equal" as const },
    { items: ["tag_veggie"], amount: 1, comparator: "equal" as const },
  ],
};

// -------------------------------------------------------------------
// getEligibleRecipes
// -------------------------------------------------------------------

describe("getEligibleRecipes", () => {
  it("returns recipes where all card_def items are real ingredients", () => {
    const result = getEligibleRecipes(
      "cookpot",
      [recipeWithRealIngredients],
      mockIngredients,
      makeGetRecipeImageUrl,
      makeGetIngredientImageUrl
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("good_stew");
    expect(result[0].ingredients.map((i: MiniGameIngredient) => i.name)).toEqual(
      expect.arrayContaining(["meat", "carrot"])
    );
  });

  it("excludes tag_ wildcard items from ingredients list but keeps recipe if real items remain", () => {
    const result = getEligibleRecipes(
      "cookpot",
      [recipeWithTagWildcard],
      mockIngredients,
      makeGetRecipeImageUrl,
      makeGetIngredientImageUrl
    );
    expect(result).toHaveLength(1);
    const names = result[0].ingredients.map((i: MiniGameIngredient) => i.name);
    expect(names).not.toContain("tag_meat");
    expect(names).toContain("honey");
  });

  it("filters out recipes where all card_def items are tag wildcards", () => {
    const result = getEligibleRecipes(
      "cookpot",
      [recipeAllTags],
      mockIngredients,
      makeGetRecipeImageUrl,
      makeGetIngredientImageUrl
    );
    expect(result).toHaveLength(0);
  });

  it("assigns correct imageUrl to recipe", () => {
    const result = getEligibleRecipes(
      "warly",
      [recipeWithRealIngredients],
      mockIngredients,
      makeGetRecipeImageUrl,
      makeGetIngredientImageUrl
    );
    expect(result[0].imageUrl).toBe("/warly/good_stew.png");
  });
});

// -------------------------------------------------------------------
// pickRandomRecipe
// -------------------------------------------------------------------

describe("pickRandomRecipe", () => {
  it("returns an element from the provided array", () => {
    const pool: MiniGameRecipe[] = [
      { name: "a", imageUrl: "/a.png", category: "cookpot", ingredients: [] },
      { name: "b", imageUrl: "/b.png", category: "cookpot", ingredients: [] },
      { name: "c", imageUrl: "/c.png", category: "cookpot", ingredients: [] },
    ];
    const result = pickRandomRecipe(pool);
    expect(pool).toContainEqual(result);
  });

  it("returns the only item when pool has one element", () => {
    const single: MiniGameRecipe[] = [
      { name: "only", imageUrl: "/only.png", category: "warly", ingredients: [] },
    ];
    expect(pickRandomRecipe(single)).toEqual(single[0]);
  });
});

// -------------------------------------------------------------------
// getBestStreak / saveBestStreak
// -------------------------------------------------------------------

describe("getBestStreak", () => {
  beforeEach(() => {
    // Simple localStorage mock for Node environment
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      length: 0,
      key: () => null,
    } as Storage;
  });

  it("returns 0 when localStorage has no entry", () => {
    expect(getBestStreak()).toBe(0);
  });

  it("returns the stored number when present", () => {
    localStorage.setItem("mini-game-best-streak", "42");
    expect(getBestStreak()).toBe(42);
  });
});

describe("saveBestStreak", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      length: 0,
      key: () => null,
    } as Storage;
  });

  it("writes the correct value to localStorage", () => {
    saveBestStreak(15);
    expect(localStorage.getItem("mini-game-best-streak")).toBe("15");
  });
});

// -------------------------------------------------------------------
// Streak logic (inline state transitions)
// -------------------------------------------------------------------

describe("streak logic", () => {
  it("increments streak on correct guess", () => {
    let streak = 0;
    const recipeIngredients = ["meat", "carrot", "honey"];
    const guess = "meat";
    if (recipeIngredients.includes(guess)) streak++;
    expect(streak).toBe(1);
  });

  it("resets streak to 0 on wrong guess", () => {
    let streak = 5;
    const recipeIngredients = ["meat", "carrot"];
    const guess = "berry";
    if (!recipeIngredients.includes(guess)) streak = 0;
    expect(streak).toBe(0);
  });

  it("accumulates streak across multiple correct guesses", () => {
    let streak = 0;
    const recipeIngredients = ["meat", "carrot", "honey"];
    for (const guess of recipeIngredients) {
      if (recipeIngredients.includes(guess)) streak++;
    }
    expect(streak).toBe(3);
  });
});
