"use client";

import { useState, useEffect } from "react";

export default function IntroSplash({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 4000);
    const doneTimer = setTimeout(() => onComplete(), 4800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-20 flex items-center justify-center transition-opacity duration-800 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg animate-fade-in">
          냉장고를 털어라
        </h1>
        <p className="mt-3 text-lg md:text-xl font-light tracking-widest drop-shadow-md opacity-0 animate-subtitle-in">
          ClearFridge
        </p>
      </div>
    </div>
  );
}
