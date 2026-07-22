"use client";

import { useState } from "react";
import Image from "next/image";

export default function FridgeLanding({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="animate-fade-in w-full max-w-2xl mx-auto px-4">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-2">
        냉장고를 털어라
      </h1>
      <p className="text-muted-foreground text-center mb-10 text-sm md:text-base">
        ClearFridge
      </p>

      <button
        onClick={() => setIsOpen(true)}
        className="group relative cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="냉장고 열기"
      >
        <div className="relative w-[320px] h-[320px] md:w-[430px] md:h-[430px]">
          <Image
            src="/fridge_crop.png"
            alt="냉장고"
            fill
            className="object-contain mix-blend-multiply drop-shadow-2xl group-hover:drop-shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300"
            priority
          />
        </div>

        <p className="mt-6 text-muted-foreground text-sm animate-bounce-slow">
          냉장고를 클릭해서 열어보세요
        </p>
      </button>
    </div>
  );
}
