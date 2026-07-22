import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Recipe, MatchedRecipe } from "@/lib/types";

export async function GET(request: NextRequest) {
  const ingredientsParam = request.nextUrl.searchParams.get("ingredients") || "";
  const userIngredients = ingredientsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (userIngredients.length === 0) {
    return NextResponse.json({ recipes: [] });
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select(
      `
      *,
      ingredients (*),
      recipe_steps (*),
      nutrition (*)
    `,
    )
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = userIngredients.map((i) => i.trim().toLowerCase());

  const matched: MatchedRecipe[] = (recipes || [])
    .map((row) => {
      const recipe: Recipe = {
        id: row.id,
        name: row.name,
        cooking_method: row.cooking_method,
        category: row.category,
        weight: row.weight,
        calories: row.calories,
        image_large: row.image_large,
        image_small: row.image_small,
        ingredients_raw: row.ingredients_raw,
        ingredients: (row.ingredients || []).map(
          (i: { name: string; amount: string; type: "main" | "sauce" }) => ({
            name: i.name,
            amount: i.amount,
            type: i.type,
          }),
        ),
        steps: (row.recipe_steps || [])
          .sort(
            (a: { step_order: number }, b: { step_order: number }) =>
              a.step_order - b.step_order,
          )
          .map((s: { step_order: number; description: string; image?: string }) => ({
            order: s.step_order,
            description: s.description,
            image: s.image,
          })),
        nutrition: row.nutrition?.[0]
          ? {
              calories: row.nutrition[0].calories,
              carbs: row.nutrition[0].carbs,
              protein: row.nutrition[0].protein,
              fat: row.nutrition[0].fat,
              sodium: row.nutrition[0].sodium,
            }
          : { calories: "", carbs: "", protein: "", fat: "", sodium: "" },
      };

      const mainIngredients = recipe.ingredients.filter(
        (i) => i.type === "main",
      );
      const sauceIngredients = recipe.ingredients.filter(
        (i) => i.type === "sauce",
      );

      const matchedMain = mainIngredients.filter((i) =>
        normalized.some((u) => i.name.includes(u) || u.includes(i.name)),
      );
      const matchedSauce = sauceIngredients.filter((i) =>
        normalized.some((u) => i.name.includes(u) || u.includes(i.name)),
      );

      const mainRate =
        mainIngredients.length > 0
          ? matchedMain.length / mainIngredients.length
          : 1;
      const sauceRate =
        sauceIngredients.length > 0
          ? matchedSauce.length / sauceIngredients.length
          : 1;

      const matchRate = Math.round(
        (mainRate * 0.7 + sauceRate * 0.3) * 100,
      );

      return {
        ...recipe,
        match_rate: matchRate,
        matched_ingredients: [
          ...matchedMain.map((i) => i.name),
          ...matchedSauce.map((i) => i.name),
        ],
        missing_main: mainIngredients
          .filter(
            (i) =>
              !normalized.some(
                (u) => i.name.includes(u) || u.includes(i.name),
              ),
          )
          .map((i) => i.name),
        missing_sauce: sauceIngredients
          .filter(
            (i) =>
              !normalized.some(
                (u) => i.name.includes(u) || u.includes(i.name),
              ),
          )
          .map((i) => i.name),
      };
    })
    .filter((r) => r.match_rate > 0)
    .sort((a, b) => b.match_rate - a.match_rate);

  return NextResponse.json({ recipes: matched });
}
