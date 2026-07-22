"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import IntroSplash from "@/components/IntroSplash";
import AuthForm from "@/components/AuthForm";
import FridgeLanding from "@/components/FridgeLanding";
import IngredientInput from "@/components/IngredientInput";

type Phase = "loading" | "splash" | "auth" | "main";

const GUEST_MAX_SEARCHES = 3;

export default function Home() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [isGuest, setIsGuest] = useState(false);
  const [guestSearchCount, setGuestSearchCount] = useState(0);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPhase("main");
      } else {
        const guestUsed = localStorage.getItem("guestUsed") === "true";
        const count = parseInt(
          localStorage.getItem("guestSearchCount") || "0",
          10,
        );

        if (guestUsed && count < GUEST_MAX_SEARCHES) {
          setIsGuest(true);
          setGuestSearchCount(count);
          setPhase("main");
        } else {
          setPhase("splash");
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsGuest(false);
        setPhase("main");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setPhase("auth");
  }, []);

  function handleGuestMode() {
    localStorage.setItem("guestUsed", "true");
    setIsGuest(true);
    setGuestSearchCount(
      parseInt(localStorage.getItem("guestSearchCount") || "0", 10),
    );
    setGuestLimitReached(false);
    setPhase("main");
  }

  function handleSearch() {
    if (ingredients.length === 0) return;

    if (isGuest) {
      if (guestSearchCount >= GUEST_MAX_SEARCHES) {
        setGuestLimitReached(true);
        setIsGuest(false);
        setPhase("auth");
        return;
      }
      const newCount = guestSearchCount + 1;
      setGuestSearchCount(newCount);
      localStorage.setItem("guestSearchCount", String(newCount));
    }

    const query = encodeURIComponent(ingredients.join(","));
    router.push(`/recipes?ingredients=${query}`);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsGuest(false);
    setGuestLimitReached(false);
    setPhase("auth");
  }

  function handleGuestExit() {
    setIsGuest(false);
    setPhase("auth");
  }

  if (phase === "loading") return null;

  const showBackground = phase === "splash" || phase === "auth";
  const guestRemaining = GUEST_MAX_SEARCHES - guestSearchCount;

  return (
    <>
      {showBackground && (
        <div className="fixed inset-0 z-0">
          <Image
            src="/intro-bg.jpg"
            alt="세련된 주방"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {phase === "splash" && <IntroSplash onComplete={handleSplashComplete} />}

      {phase === "auth" && (
        <AuthForm
          onGuestMode={handleGuestMode}
          guestLimitReached={guestLimitReached}
        />
      )}

      {phase === "main" && (
        <main className="animate-fade-in flex-1 flex flex-col items-center justify-center py-8 relative">
          <div className="absolute top-4 right-4">
            {isGuest ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  남은 검색 {guestRemaining}회
                </span>
                <button
                  onClick={handleGuestExit}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition"
                >
                  로그인
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                로그아웃
              </button>
            )}
          </div>

          <FridgeLanding>
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold">
                  냉장고 속 재료는?
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  재료를 입력하고 레시피를 찾아보세요
                </p>
              </div>

              <IngredientInput
                ingredients={ingredients}
                onAdd={(item) => setIngredients((prev) => [...prev, item])}
                onRemove={(item) =>
                  setIngredients((prev) => prev.filter((i) => i !== item))
                }
              />

              <button
                onClick={handleSearch}
                disabled={ingredients.length === 0}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-primary/20"
              >
                레시피 찾기
              </button>

              {ingredients.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {ingredients.length}개 재료로 만들 수 있는 레시피를 찾아볼게요
                </p>
              )}
            </div>
          </FridgeLanding>
        </main>
      )}
    </>
  );
}
