const ALLOWED_HOSTS = ["www.foodsafetykorea.go.kr"];

export function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url || !url.startsWith("http")) return false;
  try {
    return ALLOWED_HOSTS.some((h) => new URL(url).hostname.endsWith(h));
  } catch {
    return false;
  }
}
