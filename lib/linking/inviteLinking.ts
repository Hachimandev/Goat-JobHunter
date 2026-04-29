export function extractInviteTokenFromUrl(url: string): string | null {
  const match = url.match(/\/invite\/([^/?#]+)/i);
  return match?.[1] ?? null;
}
