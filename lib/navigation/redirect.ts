const ALLOWED_PREFIXES = ["/invite/", "/(tabs)/chat", "/chat/"];

export function normalizeRedirectPath(input?: string): string {
  if (!input) return "/(tabs)/chat";
  if (/^https?:\/\//i.test(input)) return "/(tabs)/chat";
  const decoded = decodeURIComponent(input);
  return ALLOWED_PREFIXES.some((p) => decoded.startsWith(p))
    ? decoded
    : "/(tabs)/chat";
}
