import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `당신은 한국 가정식 요리 전문가입니다.
사용자가 냉장고에 있는 재료를 알려주면, 그 재료로 만들 수 있는 한국 가정식 레시피 3개를 추천해주세요.

규칙:
- 반드시 사용자가 가진 재료를 최대한 활용하세요
- 한국 가정에서 흔히 있는 기본 양념(소금, 설탕, 간장, 고추장, 된장, 참기름, 식용유, 후추, 마늘, 파 등)은 있다고 가정하세요
- 실제로 만들 수 있는 현실적인 레시피만 추천하세요
- 조리 과정은 구체적이고 따라하기 쉽게 작성하세요

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
{
  "recipes": [
    {
      "name": "레시피 이름",
      "description": "한 줄 설명",
      "difficulty": "쉬움|보통|어려움",
      "cooking_time": "약 20분",
      "servings": "2인분",
      "ingredients": [
        { "name": "재료명", "amount": "분량", "owned": true/false }
      ],
      "steps": ["1단계 설명", "2단계 설명", ...],
      "tip": "요리 팁 한 줄"
    }
  ]
}

owned가 true인 재료는 사용자가 가지고 있는 재료, false는 기본 양념이나 추가로 필요한 재료입니다.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    const { ingredients } = await request.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "재료를 입력해주세요." },
        { status: 400 },
      );
    }

    const userMessage = `냉장고에 있는 재료: ${ingredients.join(", ")}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI 응답을 받지 못했습니다." },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(content);
    const recipes = parsed.recipes.map(
      (r: Record<string, unknown>, idx: number) => ({
        ...r,
        id: `ai-${Date.now()}-${idx}`,
      }),
    );

    return NextResponse.json({ recipes });
  } catch (e) {
    const message = e instanceof SyntaxError
      ? "AI 응답 파싱에 실패했습니다."
      : "레시피 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
