import type { Href } from "expo-router";

const DEFAULT_REDIRECT_PATH: Href = "/(tabs)/chat";
const ALLOWED_PREFIXES = ["/invite/", "/(tabs)/chat", "/chat/"];

function safeDecodePath(input: string): string | null {
  try {
    return decodeURIComponent(input);
  } catch {
    return null;
  }
}

export function normalizeRedirectPath(input?: string): Href {
  const normalizedInput = input?.trim();

  if (!normalizedInput) return DEFAULT_REDIRECT_PATH;
  if (/^https?:\/\//i.test(normalizedInput)) return DEFAULT_REDIRECT_PATH;

  const decoded = safeDecodePath(normalizedInput);
  if (!decoded) return DEFAULT_REDIRECT_PATH;

  return ALLOWED_PREFIXES.some((prefix) => decoded.startsWith(prefix))
    ? (decoded as Href)
    : DEFAULT_REDIRECT_PATH;
}
