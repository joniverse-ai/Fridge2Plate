import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SerpAPI 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
  }

  try {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_images");
    url.searchParams.set("q", `${query} 레시피`);
    url.searchParams.set("ijn", "0");
    url.searchParams.set("num", "1");
    url.searchParams.set("api_key", apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "이미지 검색 실패" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const image = data.images_results?.[0];

    if (!image) {
      return NextResponse.json({ imageUrl: null, credit: null });
    }

    return NextResponse.json({
      imageUrl: image.original,
      credit: {
        name: image.source,
        link: image.link,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "이미지 검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
