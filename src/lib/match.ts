import { Recipe, MatchedRecipe } from "./types";

export function matchRecipes(
  recipes: Recipe[],
  userIngredients: string[]
): MatchedRecipe[] {
  const normalized = userIngredients.map((i) => i.trim().toLowerCase());

  return recipes
    .map((recipe) => {
      const mainIngredients = recipe.ingredients.filter(
        (i) => i.type === "main"
      );
      const sauceIngredients = recipe.ingredients.filter(
        (i) => i.type === "sauce"
      );

      const matchedMain = mainIngredients.filter((i) =>
        normalized.some((u) => i.name.includes(u) || u.includes(i.name))
      );
      const matchedSauce = sauceIngredients.filter((i) =>
        normalized.some((u) => i.name.includes(u) || u.includes(i.name))
      );

      const mainWeight = 0.7;
      const sauceWeight = 0.3;

      const mainRate =
        mainIngredients.length > 0
          ? matchedMain.length / mainIngredients.length
          : 1;
      const sauceRate =
        sauceIngredients.length > 0
          ? matchedSauce.length / sauceIngredients.length
          : 1;

      const matchRate = Math.round(
        (mainRate * mainWeight + sauceRate * sauceWeight) * 100
      );

      const missingMain = mainIngredients
        .filter(
          (i) =>
            !normalized.some((u) => i.name.includes(u) || u.includes(i.name))
        )
        .map((i) => i.name);

      const missingSauce = sauceIngredients
        .filter(
          (i) =>
            !normalized.some((u) => i.name.includes(u) || u.includes(i.name))
        )
        .map((i) => i.name);

      return {
        ...recipe,
        match_rate: matchRate,
        matched_ingredients: [
          ...matchedMain.map((i) => i.name),
          ...matchedSauce.map((i) => i.name),
        ],
        missing_main: missingMain,
        missing_sauce: missingSauce,
      };
    })
    .filter((r) => r.match_rate > 0)
    .sort((a, b) => b.match_rate - a.match_rate);
}
