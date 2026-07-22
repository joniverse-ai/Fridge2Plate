"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "sent";

interface AuthFormProps {
  onGuestMode?: () => void;
  guestLimitReached?: boolean;
}

export default function AuthForm({
  onGuestMode,
  guestLimitReached,
}: AuthFormProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGuest, setShowGuest] = useState(false);

  useEffect(() => {
    const guestUsed = localStorage.getItem("guestUsed");
    if (!guestUsed) {
      setShowGuest(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        setError("이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.");
      } else if (error.message === "Invalid login credentials") {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError(error.message);
      }
    }
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (!/\d/.test(password)) {
      setError("비밀번호에 숫자가 포함되어야 합니다.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMode("sent");
    }
    setLoading(false);
  }

  if (mode === "sent") {
    return (
      <div className="animate-fade-in fixed inset-0 z-10 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
            ✉️
          </div>
          <h2 className="text-2xl font-bold text-white drop-shadow-md">
            인증 메일을 보냈습니다
          </h2>
          <p className="text-white/80 text-sm leading-relaxed drop-shadow-sm">
            <span className="font-medium text-white">{email}</span>
            <br />
            으로 전송된 인증 메일을 확인해주세요.
          </p>
          <p className="text-white/60 text-xs">
            메일이 보이지 않으면 스팸함을 확인해주세요.
          </p>
          <button
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className="text-white/90 text-sm font-medium hover:text-white hover:underline transition"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-10 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            냉장고를 털어라
          </h1>
          <p className="text-white/70 text-sm mt-1 drop-shadow-sm">
            ClearFridge
          </p>
        </div>

        {guestLimitReached && (
          <div className="animate-fade-in text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
            <p className="text-white text-sm font-medium">
              무료 둘러보기가 끝났습니다
            </p>
            <p className="text-white/70 text-xs mt-1">
              계속 사용하려면 로그인해주세요
            </p>
          </div>
        )}

        <form
          onSubmit={mode === "login" ? handleLogin : handleSignup}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 text-white/90"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 text-white/90"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "signup" ? 8 : 1}
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              placeholder={mode === "signup" ? "8자 이상, 숫자 포함" : "비밀번호 입력"}
            />
            {mode === "signup" && (
              <p className="mt-1.5 text-xs text-white/50">
                8자 이상, 숫자를 포함해야 합니다
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div className="animate-fade-in">
              <label
                htmlFor="password-confirm"
                className="block text-sm font-medium mb-1 text-white/90"
              >
                비밀번호 확인
              </label>
              <input
                id="password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                placeholder="비밀번호를 다시 입력"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-300 bg-red-900/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition shadow-lg shadow-black/20"
          >
            {loading
              ? "잠시만요..."
              : mode === "login"
                ? "로그인"
                : "회원가입"}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-white/70">
            {mode === "login" ? (
              <>
                계정이 없으신가요?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="text-white font-medium hover:underline"
                >
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-white font-medium hover:underline"
                >
                  로그인
                </button>
              </>
            )}
          </p>

          {showGuest && mode === "login" && onGuestMode && (
            <button
              onClick={onGuestMode}
              className="text-sm text-white/50 hover:text-white/80 transition"
            >
              둘러보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
