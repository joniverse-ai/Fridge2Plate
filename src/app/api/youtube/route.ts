import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const YOUTUBE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json({ videoId: null });
  }

  const { data: cached } = await supabase
    .from("youtube_cache")
    .select("video_id")
    .eq("query", query)
    .single();

  if (cached?.video_id) {
    return NextResponse.json({ videoId: cached.video_id });
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

  if (videoId && YOUTUBE_VIDEO_ID_RE.test(videoId)) {
    await supabase
      .from("youtube_cache")
      .upsert({ query, video_id: videoId }, { onConflict: "query" });
  }

  return NextResponse.json({ videoId });
}
