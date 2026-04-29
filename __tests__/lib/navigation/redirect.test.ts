import { normalizeRedirectPath } from "@/lib/navigation/redirect";

describe("normalizeRedirectPath", () => {
  it("allows invite path redirect", () => {
    expect(normalizeRedirectPath("/invite/abc")).toBe("/invite/abc");
  });

  it("rejects external url redirect", () => {
    expect(normalizeRedirectPath("https://evil.site")).toBe("/(tabs)/chat");
  });

  it("returns default when undefined", () => {
    expect(normalizeRedirectPath(undefined)).toBe("/(tabs)/chat");
  });

  it("handles encoded paths", () => {
    expect(normalizeRedirectPath(encodeURIComponent("/invite/test"))).toBe("/invite/test");
  });
});
