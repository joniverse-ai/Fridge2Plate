"use client";

import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { AIRecipe } from "@/lib/types";
import YoutubeEmbed from "@/components/YoutubeEmbed";

function RecipeDetail() {
  const params = useParams();
  const id = params.id as string;

  const [recipe, setRecipe] = useState<AIRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`recipe-${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as AIRecipe;
        setRecipe(parsed);

        fetch(`/api/youtube?q=${encodeURIComponent(parsed.name)}`)
          .then((res) => res.json())
          .then((yt) => setYoutubeVideoId(yt.videoId))
          .catch(() => {});
      }
    } catch {}
    setLoading(false);
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
        <p className="text-sm text-muted-foreground mt-1">
          검색 결과에서 다시 선택해주세요
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
        >
          처음으로 돌아가기
        </Link>
      </main>
    );
  }

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

      <div className="w-full bg-muted rounded-2xl overflow-hidden flex items-center justify-center mb-6">
        {recipe.image_url ? (
          <div className="w-full">
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="w-full h-48 md:h-64 object-cover"
            />
            {recipe.image_credit && (
              <p className="text-xs text-muted-foreground text-right px-3 py-1">
                Photo by{" "}
                <a
                  href={`${recipe.image_credit.link}?utm_source=fridge2plate&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {recipe.image_credit.name}
                </a>{" "}
                on Unsplash
              </p>
            )}
          </div>
        ) : (
          <div className="py-8">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
      </div>

      <p className="text-muted-foreground mb-4">{recipe.description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full">
          {recipe.difficulty}
        </span>
        <span className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full">
          {recipe.cooking_time}
        </span>
        <span className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full">
          {recipe.servings}
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
            {recipe.ingredients.map((ing) => (
              <div
                key={ing.name}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${ing.owned ? "bg-match-high" : "bg-match-low"}`}
                  />
                  <span
                    className={
                      ing.owned
                        ? "text-card-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {ing.name}
                  </span>
                  {!ing.owned && (
                    <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                      추가 필요
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {ing.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">조리 순서</h2>
        <div className="space-y-4">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm md:text-base">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {recipe.tip && (
        <section className="mb-8">
          <div className="bg-tag-bg rounded-2xl p-4">
            <p className="text-sm">
              <span className="font-bold">💡 팁:</span> {recipe.tip}
            </p>
          </div>
        </section>
      )}
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
