jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/services/chatRoom/invite/inviteApi", () => ({
  useJoinByInviteMutation: jest.fn(),
}));

import { renderHook, act } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { useJoinByInviteMutation } from "@/services/chatRoom/invite/inviteApi";
import { Alert } from "react-native";
import { useInviteJoinFlow } from "@/hooks/useInviteJoinFlow";

jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

describe("useInviteJoinFlow", () => {
  let mockRouter: any;
  let mockJoinByInvite: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter = {
      replace: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    mockJoinByInvite = jest.fn();
    (useJoinByInviteMutation as jest.Mock).mockReturnValue([
      mockJoinByInvite,
      { isLoading: false },
    ]);
  });

  it("should return handlePrimaryAction and isJoining from hook", () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: false });

    const { result } = renderHook(() => useInviteJoinFlow());

    expect(result.current.handlePrimaryAction).toBeDefined();
    expect(typeof result.current.handlePrimaryAction).toBe("function");
    expect(result.current.isJoining).toBeDefined();
    expect(typeof result.current.isJoining).toBe("boolean");
  });

  it("should redirect to signin when user not signed in", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: false });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("test-token");
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      "/(auth)/signin?redirect=%2Finvite%2Ftest-token",
    );
  });

  it("should navigate to chat room after successful join", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: true });

    mockJoinByInvite.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValueOnce({
        data: { roomId: 456, joined: true },
      }),
    });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("test-token");
    });

    expect(mockRouter.replace).toHaveBeenCalledWith("/chat/456");
  });

  it("should handle empty token gracefully", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: true });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("");
    });

    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockJoinByInvite).not.toHaveBeenCalled();
  });
});


describe("useInviteJoinFlow", () => {
  let mockRouter: any;
  let mockJoinByInvite: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter = {
      replace: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    mockJoinByInvite = jest.fn();
    (useJoinByInviteMutation as jest.Mock).mockReturnValue([
      mockJoinByInvite,
      { isLoading: false },
    ]);
  });

  it("should return handlePrimaryAction and isJoining from hook", () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: false });

    const { result } = renderHook(() => useInviteJoinFlow());

    expect(result.current.handlePrimaryAction).toBeDefined();
    expect(typeof result.current.handlePrimaryAction).toBe("function");
    expect(result.current.isJoining).toBeDefined();
    expect(typeof result.current.isJoining).toBe("boolean");
  });

  it("should redirect to signin when user not signed in and handlePrimaryAction is called", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: false });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("test-token");
    });

    expect(mockRouter.replace).toHaveBeenCalledWith(
      "/(auth)/signin?redirect=%2Finvite%2Ftest-token",
    );
  });

  it("should call joinByInvite mutation when user is signed in", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: true });

    mockJoinByInvite.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValueOnce({
        data: { roomId: 123, joined: true },
      }),
    });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("test-token");
    });

    expect(mockJoinByInvite).toHaveBeenCalledWith({ inviteToken: "test-token" });
  });

  it("should navigate to chat room after successful join", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: true });

    mockJoinByInvite.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValueOnce({
        data: { roomId: 456, joined: true },
      }),
    });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("test-token");
    });

    expect(mockRouter.replace).toHaveBeenCalledWith("/chat/456");
  });

  it("should show alert on join error", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: true });

    mockJoinByInvite.mockReturnValueOnce({
      unwrap: jest
        .fn()
        .mockRejectedValueOnce({
          data: { message: "Không thể tham gia nhóm" },
        }),
    });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("test-token");
    });

    expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Không thể tham gia nhóm");
  });

  it("should handle empty token gracefully", async () => {
    (useUser as jest.Mock).mockReturnValue({ isSignedIn: true });

    const { result } = renderHook(() => useInviteJoinFlow());

    await act(async () => {
      await result.current.handlePrimaryAction("");
    });

    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockJoinByInvite).not.toHaveBeenCalled();
  });
});
