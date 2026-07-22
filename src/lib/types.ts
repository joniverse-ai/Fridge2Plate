export interface Recipe {
  id: number;
  name: string;
  cooking_method: string;
  category: string;
  weight: string;
  calories: string;
  image_large: string;
  image_small: string;
  ingredients_raw: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition: Nutrition;
  youtube_video_id?: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  type: "main" | "sauce";
}

export interface RecipeStep {
  order: number;
  description: string;
  image?: string;
}

export interface Nutrition {
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
  sodium: string;
}

export interface MatchedRecipe extends Recipe {
  match_rate: number;
  matched_ingredients: string[];
  missing_main: string[];
  missing_sauce: string[];
}
