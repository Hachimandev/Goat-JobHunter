const INVITE_TOKEN_REGEX = /^[A-Za-z0-9_-]{8,128}$/;

export type InviteSource = "in_app_scan" | "deep_link";

export type InviteParseError =
  | "empty_payload"
  | "invalid_url"
  | "unsupported_protocol"
  | "unsupported_host"
  | "invalid_path"
  | "invalid_token";

export type InviteParseResult =
  | { ok: true; token: string; sourcePayload: string }
  | { ok: false; reason: InviteParseError };

export type InviteJoinOutcome =
  | "joined"
  | "already_joined"
  | "token_expired"
  | "token_revoked"
  | "token_not_found"
  | "unauthorized"
  | "network_error";

export function isValidInviteToken(token: string): boolean {
  return INVITE_TOKEN_REGEX.test(token.trim());
}

export function parseInviteTokenFromPathToken(
  token: string,
): InviteParseResult {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return { ok: false, reason: "empty_payload" };
  }
  if (!isValidInviteToken(normalizedToken)) {
    return { ok: false, reason: "invalid_token" };
  }
  return { ok: true, token: normalizedToken, sourcePayload: normalizedToken };
}

export function parseInviteUrl(
  raw: string,
  allowedHosts: readonly string[],
): InviteParseResult {
  const payload = raw.trim();
  if (!payload) {
    return { ok: false, reason: "empty_payload" };
  }

  let parsed: URL;
  try {
    parsed = new URL(payload);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }

  if (
    parsed.protocol.toLowerCase() !== "https:" &&
    parsed.hostname.toLowerCase() !== "localhost"
  ) {
    return { ok: false, reason: "unsupported_protocol" };
  }

  const host = parsed.hostname.toLowerCase();
  const isAllowedHost = allowedHosts.some(
    (candidate) => candidate.toLowerCase() === host,
  );
  if (!isAllowedHost) {
    return { ok: false, reason: "unsupported_host" };
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "invite") {
    return { ok: false, reason: "invalid_path" };
  }

  const token = segments[1]?.trim() ?? "";
  if (!isValidInviteToken(token)) {
    return { ok: false, reason: "invalid_token" };
  }

  return { ok: true, token, sourcePayload: payload };
}

export function getInviteAllowedHosts(): string[] {
  return [
    "goat-jobhunter.click",
    "www.goat-jobhunter.click",
    "localhost",
    "127.0.0.1",
    "10.0.2.2",
  ];
}

export function redactInviteToken(value: string): string {
  if (!value) return "";
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

type InviteAnalyticsEvent =
  | "invite_scan_started"
  | "invite_payload_scanned"
  | "invite_payload_invalid"
  | "invite_join_attempt"
  | "invite_join_success"
  | "invite_join_failed";

export function trackInviteEvent(
  event: InviteAnalyticsEvent,
  payload: Record<string, unknown>,
): void {
  console.info(`[analytics] ${event}`, payload);
}
