"use client";

import { useState, KeyboardEvent } from "react";

interface IngredientInputProps {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
}

export default function IngredientInput({
  ingredients,
  onAdd,
  onRemove,
}: IngredientInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const trimmed = input.trim();
      if (!ingredients.includes(trimmed)) {
        onAdd(trimmed);
      }
      setInput("");
    }
  }

  function handleAdd() {
    const trimmed = input.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      onAdd(trimmed);
      setInput("");
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-muted-foreground">
        냉장고에 있는 재료를 입력하세요
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 김치, 돼지고기, 두부..."
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          추가
        </button>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {ingredients.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tag-bg text-tag-text rounded-full text-sm font-medium"
            >
              {item}
              <button
                onClick={() => onRemove(item)}
                className="hover:text-red-600 transition cursor-pointer"
                aria-label={`${item} 삭제`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
