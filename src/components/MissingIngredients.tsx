"use client";

import { useState } from "react";

interface MissingIngredientsProps {
  missingMain: string[];
  missingSauce: string[];
}

export default function MissingIngredients({
  missingMain,
  missingSauce,
}: MissingIngredientsProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  if (missingMain.length === 0 && missingSauce.length === 0) {
    return (
      <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
        모든 재료가 준비되어 있어요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 소스·양념류 (확인 우선) */}
      {missingSauce.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">
            양념·소스류 확인
          </h4>
          <div className="space-y-2">
            {missingSauce.map((name) => (
              <label
                key={name}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  checked.has(name)
                    ? "bg-green-50 border-green-300"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked.has(name)}
                  onChange={() => toggle(name)}
                  className="w-4 h-4 accent-primary"
                />
                <span
                  className={`text-sm ${checked.has(name) ? "line-through text-muted-foreground" : "text-card-foreground"}`}
                >
                  {name}
                </span>
                {checked.has(name) && (
                  <span className="ml-auto text-xs text-green-600">
                    있어요!
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 메인 재료 부족 (안내만) */}
      {missingMain.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">
            부족한 메인 재료
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingMain.map((name) => (
              <span
                key={name}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-200"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
