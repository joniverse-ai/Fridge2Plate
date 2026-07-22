"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Recipe } from "@/lib/types";
import MissingIngredients from "@/components/MissingIngredients";
import YoutubeEmbed from "@/components/YoutubeEmbed";

function RecipeDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);

  const userIngredients = (searchParams.get("ingredients") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.recipe) {
          setRecipe(data.recipe);
          fetch(`/api/youtube?q=${encodeURIComponent(data.recipe.name)}`)
            .then((res) => res.json())
            .then((yt) => setYoutubeVideoId(yt.videoId));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">레시피를 불러오는 중...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-20">
        <p className="text-4xl mb-4">🤷</p>
        <p className="text-lg font-medium">레시피를 찾을 수 없어요</p>
        <Link
          href="/"
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
        >
          처음으로 돌아가기
        </Link>
      </main>
    );
  }

  const missingMain = recipe.ingredients
    .filter((i) => i.type === "main")
    .filter(
      (i) =>
        !userIngredients.some(
          (u) => i.name.includes(u) || u.includes(i.name),
        ),
    )
    .map((i) => i.name);

  const missingSauce = recipe.ingredients
    .filter((i) => i.type === "sauce")
    .filter(
      (i) =>
        !userIngredients.some(
          (u) => i.name.includes(u) || u.includes(i.name),
        ),
    )
    .map((i) => i.name);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => history.back()}
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
        </button>
        <h1 className="text-xl md:text-2xl font-bold">{recipe.name}</h1>
      </div>

      <div className="w-full h-48 md:h-64 bg-muted rounded-2xl flex items-center justify-center mb-6">
        {recipe.image_large ? (
          <img
            src={recipe.image_large}
            alt={recipe.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <span className="text-6xl">🍽️</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full">
          {recipe.cooking_method}
        </span>
        <span className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full">
          {recipe.category}
        </span>
        <span className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full">
          {recipe.calories}
        </span>
      </div>

      {youtubeVideoId && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">영상으로 보기</h2>
          <YoutubeEmbed videoId={youtubeVideoId} title={recipe.name} />
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">재료</h2>
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="space-y-2">
            {recipe.ingredients.map((ing) => {
              const isOwned = userIngredients.some(
                (u) => ing.name.includes(u) || u.includes(ing.name),
              );
              return (
                <div
                  key={ing.name}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${isOwned ? "bg-match-high" : "bg-match-low"}`}
                    />
                    <span
                      className={
                        isOwned
                          ? "text-card-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {ing.name}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                      {ing.type === "main" ? "메인" : "양념"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {ing.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {(missingMain.length > 0 || missingSauce.length > 0) && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">부족한 재료 확인</h2>
          <MissingIngredients
            missingMain={missingMain}
            missingSauce={missingSauce}
          />
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">조리 순서</h2>
        <div className="space-y-4">
          {recipe.steps.map((step) => (
            <div key={step.order} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {step.order}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm md:text-base">{step.description}</p>
                {step.image && (
                  <img
                    src={step.image}
                    alt={`${step.order}단계`}
                    className="mt-2 rounded-xl w-full max-w-sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">영양 정보</h2>
        <div className="grid grid-cols-5 gap-2">
          {[
            {
              label: "칼로리",
              value: recipe.nutrition.calories,
              unit: "kcal",
            },
            { label: "탄수화물", value: recipe.nutrition.carbs, unit: "" },
            { label: "단백질", value: recipe.nutrition.protein, unit: "" },
            { label: "지방", value: recipe.nutrition.fat, unit: "" },
            { label: "나트륨", value: recipe.nutrition.sodium, unit: "" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-3 bg-card rounded-xl border border-border"
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-bold mt-1">
                {item.value}
                {item.unit}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function RecipeDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">레시피를 불러오는 중...</p>
        </div>
      }
    >
      <RecipeDetail />
    </Suspense>
  );
}
