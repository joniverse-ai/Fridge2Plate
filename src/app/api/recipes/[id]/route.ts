import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const recipeId = Number(id);

  const { data: row, error } = await supabase
    .from("recipes")
    .select(
      `
      *,
      ingredients (*),
      recipe_steps (*),
      nutrition (*)
    `,
    )
    .eq("id", recipeId)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const recipe = {
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
      .map(
        (s: { step_order: number; description: string; image?: string }) => ({
          order: s.step_order,
          description: s.description,
          image: s.image,
        }),
      ),
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

  return NextResponse.json({ recipe });
}
