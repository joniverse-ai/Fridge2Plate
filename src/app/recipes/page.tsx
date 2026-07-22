"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { MatchedRecipe } from "@/lib/types";
import RecipeCard from "@/components/RecipeCard";

function RecipeResults() {
  const searchParams = useSearchParams();
  const ingredientsParam = searchParams.get("ingredients") || "";
  const userIngredients = ingredientsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [matched, setMatched] = useState<MatchedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userIngredients.length === 0) {
      setLoading(false);
      return;
    }

    fetch(`/api/recipes?ingredients=${encodeURIComponent(ingredientsParam)}`)
      .then((res) => res.json())
      .then((data) => setMatched(data.recipes || []))
      .finally(() => setLoading(false));
  }, [ingredientsParam]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">레시피를 찾는 중...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-muted transition"
          aria-label="뒤로가기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">검색 결과</h1>
          <p className="text-sm text-muted-foreground">
            {userIngredients.length}개 재료 · {matched.length}개 레시피 발견
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {userIngredients.map((item) => (
          <span
            key={item}
            className="text-xs px-3 py-1 bg-tag-bg text-tag-text rounded-full font-medium"
          >
            {item}
          </span>
        ))}
      </div>

      {matched.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🥲</p>
          <p className="text-lg font-medium">매칭되는 레시피가 없어요</p>
          <p className="text-sm text-muted-foreground mt-1">
            다른 재료를 추가해 보세요
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
          >
            다시 검색하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matched.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">레시피를 찾는 중...</p>
        </div>
      }
    >
      <RecipeResults />
    </Suspense>
  );
}
