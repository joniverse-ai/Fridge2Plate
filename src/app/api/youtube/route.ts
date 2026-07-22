import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json({ videoId: null });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your_youtube_api_key_here") {
    return NextResponse.json({ videoId: null });
  }

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", `${query} 레시피 만들기`);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "1");
  searchUrl.searchParams.set("key", apiKey);

  const res = await fetch(searchUrl.toString());

  if (!res.ok) {
    return NextResponse.json({ videoId: null });
  }

  const data = await res.json();
  const videoId = data.items?.[0]?.id?.videoId || null;

  return NextResponse.json({ videoId });
}
