import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COOKRCP_API_KEY = process.env.COOKRCP_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SAUCE_KEYWORDS = [
  "간장", "된장", "고추장", "소금", "설탕", "식초", "참기름", "들기름",
  "고춧가루", "후추", "다진마늘", "생강", "맛술", "미림", "굴소스",
  "케첩", "마요네즈", "머스타드", "올리브유", "식용유", "깨", "통깨",
  "육수", "멸치", "다시마", "물", "전분", "녹말", "밀가루",
];

function classifyIngredient(name: string): "main" | "sauce" {
  return SAUCE_KEYWORDS.some((kw) => name.includes(kw)) ? "sauce" : "main";
}

function parseIngredients(raw: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/^(.+?)\s*([\d/]+.*)?$/);
      const name = match?.[1]?.trim() || item.trim();
      const amount = match?.[2]?.trim() || "";
      return { name, amount, type: classifyIngredient(name) };
    });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  if (!COOKRCP_API_KEY || COOKRCP_API_KEY === "your_cookrcp_api_key_here") {
    return NextResponse.json(
      { error: "COOKRCP_API_KEY가 설정되지 않았습니다." },
      { status: 400 },
    );
  }

  if (!SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다." },
      { status: 400 },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let inserted = 0;
  const pageSize = 100;

  for (let start = 1; start <= 1000; start += pageSize) {
    const end = start + pageSize - 1;
    const encodedKey = encodeURIComponent(COOKRCP_API_KEY);
    const url = `https://openapi.foodsafetykorea.go.kr/api/${encodedKey}/COOKRCP01/json/${start}/${end}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({
        error: "외부 API 요청에 실패했습니다.",
        inserted,
      });
    }

    const data = await res.json();
    const rows = data?.COOKRCP01?.row;
    if (!rows || rows.length === 0) {
      if (start === 1) {
        return NextResponse.json({
          error: "API에서 데이터를 받지 못했습니다.",
          inserted,
        });
      }
      break;
    }

    for (const row of rows) {
      const { data: recipe, error: recipeErr } = await supabase
        .from("recipes")
        .insert({
          name: row.RCP_NM,
          cooking_method: row.RCP_WAY2 || null,
          category: row.RCP_PAT2 || null,
          weight: row.INFO_WGT || null,
          calories: row.INFO_ENG ? `${row.INFO_ENG}kcal` : null,
          image_large: row.ATT_FILE_NO_MAIN || null,
          image_small: row.ATT_FILE_NO_MK || null,
          ingredients_raw: row.RCP_PARTS_DTLS || null,
        })
        .select("id")
        .single();

      if (recipeErr || !recipe) continue;

      const ingredients = parseIngredients(row.RCP_PARTS_DTLS || "");
      if (ingredients.length > 0) {
        await supabase.from("ingredients").insert(
          ingredients.map((ing) => ({
            recipe_id: recipe.id,
            name: ing.name,
            amount: ing.amount,
            type: ing.type,
          })),
        );
      }

      const steps = [];
      for (let i = 1; i <= 20; i++) {
        const desc = row[`MANUAL${String(i).padStart(2, "0")}`];
        const img = row[`MANUAL_IMG${String(i).padStart(2, "0")}`];
        if (desc && desc.trim()) {
          steps.push({
            recipe_id: recipe.id,
            step_order: i,
            description: desc.trim(),
            image: img || null,
          });
        }
      }
      if (steps.length > 0) {
        await supabase.from("recipe_steps").insert(steps);
      }

      await supabase.from("nutrition").insert({
        recipe_id: recipe.id,
        calories: row.INFO_ENG || null,
        carbs: row.INFO_CAR ? `${row.INFO_CAR}g` : null,
        protein: row.INFO_PRO ? `${row.INFO_PRO}g` : null,
        fat: row.INFO_FAT ? `${row.INFO_FAT}g` : null,
        sodium: row.INFO_NA ? `${row.INFO_NA}mg` : null,
      });

      inserted++;
    }
  }

  return NextResponse.json({ success: true, inserted });
}
