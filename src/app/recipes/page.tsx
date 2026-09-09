"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { AIRecipe } from "@/lib/types";

function saveRecipeToSession(recipe: AIRecipe) {
  try {
    sessionStorage.setItem(`recipe-${recipe.id}`, JSON.stringify(recipe));
  } catch {}
}

function AIRecipeCard({ recipe }: { recipe: AIRecipe }) {
  const difficultyColor = {
    "쉬움": "bg-match-high",
    "보통": "bg-match-mid",
    "어려움": "bg-match-low",
  }[recipe.difficulty] || "bg-match-mid";

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      onClick={() => saveRecipeToSession(recipe)}
      className="block bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden"
    >
      <div className="relative h-40 md:h-48 bg-muted flex items-center justify-center overflow-hidden">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🍳</span>
        )}
        <div
          className={`absolute top-3 right-3 ${difficultyColor} text-white text-sm font-bold px-3 py-1 rounded-full`}
        >
          {recipe.difficulty}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-card-foreground">
          {recipe.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {recipe.description}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
            {recipe.cooking_time}
          </span>
          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
            {recipe.servings}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {recipe.ingredients
            .filter((i) => i.owned)
            .map((i) => (
              <span
                key={i.name}
                className="text-xs px-2 py-0.5 bg-tag-bg text-tag-text rounded-full"
              >
                {i.name}
              </span>
            ))}
        </div>

        {recipe.ingredients.some((i) => !i.owned) && (
          <p className="mt-2 text-xs text-muted-foreground">
            추가 필요:{" "}
            <span className="text-foreground">
              {recipe.ingredients
                .filter((i) => !i.owned)
                .map((i) => i.name)
                .join(", ")}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}

function RecipeResults() {
  const searchParams = useSearchParams();
  const ingredientsParam = searchParams.get("ingredients") || "";
  const userIngredients = ingredientsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [recipes, setRecipes] = useState<AIRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userIngredients.length === 0) {
      setLoading(false);
      return;
    }

    fetch("/api/ai-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: userIngredients }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(async (data) => {
        if (data.error) throw new Error(data.error);
        const recipes: AIRecipe[] = data.recipes || [];
        setRecipes(recipes);

        const withImages = await Promise.all(
          recipes.map(async (r) => {
            try {
              const imgRes = await fetch(
                `/api/unsplash?q=${encodeURIComponent(r.name)}`,
              );
              const img = await imgRes.json();
              if (img.imageUrl) {
                return { ...r, image_url: img.imageUrl, image_credit: img.credit };
              }
            } catch {}
            return r;
          }),
        );
        setRecipes(withImages);
        withImages.forEach((r) => {
          if (r.image_url) saveRecipeToSession(r);
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ingredientsParam]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">AI가 레시피를 만들고 있어요...</p>
        <p className="text-xs text-muted-foreground">잠시만 기다려주세요</p>
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
          <h1 className="text-xl md:text-2xl font-bold">AI 추천 레시피</h1>
          <p className="text-sm text-muted-foreground">
            {userIngredients.length}개 재료로 만든 {recipes.length}개 레시피
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

      {error ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-lg font-medium">레시피를 만들지 못했어요</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
          >
            다시 시도
          </button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🥲</p>
          <p className="text-lg font-medium">레시피를 만들지 못했어요</p>
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
          {recipes.map((recipe) => (
            <AIRecipeCard key={recipe.id} recipe={recipe} />
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
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">AI가 레시피를 만들고 있어요...</p>
        </div>
      }
    >
      <RecipeResults />
    </Suspense>
  );
}
