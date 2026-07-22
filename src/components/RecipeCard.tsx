import Link from "next/link";
import { MatchedRecipe } from "@/lib/types";

function matchColor(rate: number) {
  if (rate >= 70) return "text-match-high";
  if (rate >= 40) return "text-match-mid";
  return "text-match-low";
}

function matchBg(rate: number) {
  if (rate >= 70) return "bg-match-high";
  if (rate >= 40) return "bg-match-mid";
  return "bg-match-low";
}

export default function RecipeCard({ recipe }: { recipe: MatchedRecipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}?ingredients=${encodeURIComponent(recipe.matched_ingredients.join(","))}`}
      className="block bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden"
    >
      {/* 이미지 영역 */}
      <div className="relative h-40 md:h-48 bg-muted flex items-center justify-center">
        {recipe.image_large ? (
          <img
            src={recipe.image_large}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🍳</span>
        )}

        {/* 매칭률 뱃지 */}
        <div
          className={`absolute top-3 right-3 ${matchBg(recipe.match_rate)} text-white text-sm font-bold px-3 py-1 rounded-full`}
        >
          {recipe.match_rate}%
        </div>
      </div>

      {/* 정보 */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-card-foreground">
          {recipe.name}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
            {recipe.cooking_method}
          </span>
          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
            {recipe.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {recipe.calories}
          </span>
        </div>

        {/* 보유 재료 */}
        <div className="mt-3 flex flex-wrap gap-1">
          {recipe.matched_ingredients.map((name) => (
            <span
              key={name}
              className="text-xs px-2 py-0.5 bg-tag-bg text-tag-text rounded-full"
            >
              {name}
            </span>
          ))}
        </div>

        {/* 부족 소스류 미리보기 */}
        {recipe.missing_sauce.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            필요한 양념:{" "}
            <span className="text-foreground">
              {recipe.missing_sauce.join(", ")}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
