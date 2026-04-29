import { extractInviteTokenFromUrl } from "@/lib/linking/inviteLinking";

describe("extractInviteTokenFromUrl", () => {
  it("extracts token from custom scheme url", () => {
    expect(extractInviteTokenFromUrl("goatjobhunter://invite/abc123")).toBe("abc123");
  });

  it("extracts token from https universal link", () => {
    expect(extractInviteTokenFromUrl("https://goatjobhunter.com/invite/abc123")).toBe("abc123");
  });

  it("returns null for invalid url", () => {
    expect(extractInviteTokenFromUrl("invalid")).toBeNull();
  });
});
