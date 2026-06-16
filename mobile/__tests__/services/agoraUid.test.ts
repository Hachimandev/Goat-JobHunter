import { computeAgoraUid } from "@/services/callRtc/agoraUid";

describe("computeAgoraUid", () => {
  it("returns same UID for same inputs (determinism)", () => {
    const uid1 = computeAgoraUid(100, 200, "chatroom-50");
    const uid2 = computeAgoraUid(100, 200, "chatroom-50");
    expect(uid1).toBe(uid2);
  });

  it("returns different UID for different accountId", () => {
    const uid1 = computeAgoraUid(100, 200, "chatroom-50");
    const uid2 = computeAgoraUid(200, 200, "chatroom-50");
    expect(uid1).not.toBe(uid2);
  });

  it("returns different UID for different sessionId", () => {
    const uid1 = computeAgoraUid(100, 200, "chatroom-50");
    const uid2 = computeAgoraUid(100, 300, "chatroom-50");
    expect(uid1).not.toBe(uid2);
  });

  it("returns different UID for different channelName", () => {
    const uid1 = computeAgoraUid(100, 200, "chatroom-50");
    const uid2 = computeAgoraUid(100, 200, "chatroom-99");
    expect(uid1).not.toBe(uid2);
  });

  it("returns null for accountId <= 0", () => {
    expect(computeAgoraUid(0, 200, "chatroom-50")).toBeNull();
    expect(computeAgoraUid(-1, 200, "chatroom-50")).toBeNull();
  });

  it("returns null for sessionId <= 0", () => {
    expect(computeAgoraUid(100, 0, "chatroom-50")).toBeNull();
    expect(computeAgoraUid(100, -5, "chatroom-50")).toBeNull();
  });

  it("returns null for empty or whitespace channelName", () => {
    expect(computeAgoraUid(100, 200, "")).toBeNull();
    expect(computeAgoraUid(100, 200, "  ")).toBeNull();
  });

  it("returns UID in valid range [1, 2147483647]", () => {
    const uid = computeAgoraUid(100, 200, "chatroom-50");
    expect(uid).not.toBeNull();
    expect(uid).toBeGreaterThanOrEqual(1);
    expect(uid).toBeLessThanOrEqual(2147483647);
  });

  it("uses seed format sessionId:accountId:channelName", () => {
    // Swapping accountId and sessionId should produce different UIDs
    // because the seed format is "sessionId:accountId:channelName"
    const uid1 = computeAgoraUid(100, 200, "chatroom-50");
    const uid2 = computeAgoraUid(200, 100, "chatroom-50");
    expect(uid1).not.toBe(uid2);
  });
});
