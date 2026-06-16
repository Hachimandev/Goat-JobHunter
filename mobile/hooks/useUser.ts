import { clearUser, useAuthSlice } from "@/lib/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import { api } from "@/services/api";
import { tokenManager } from "@/lib/tokenManager";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";

// Import các API services (Đảm bảo đường dẫn này khớp với project mobile của bạn)
import { useUpdateApplicantMutation } from "@/services/applicant/applicantApi";
import { useLogoutMutation, useSigninMutation } from "@/services/auth/authApi";
import { useUpdateRecruiterMutation } from "@/services/recruiter/recruiterApi";
import {
  connectWebSocketLogout,
  disconnectWebSocketLogout,
} from "@/services/WebSocketLogoutService";

const notify = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Thông báo", message);
  }
};

export function useUser() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuthSlice();

  const [signinMutation, { isLoading: isSigningIn }] = useSigninMutation();
  const [updateApplicant, { isLoading: isUpdatingApplicant }] =
    useUpdateApplicantMutation();
  const [updateRecruiter, { isLoading: isUpdatingRecruiter }] =
    useUpdateRecruiterMutation();
  const [logoutMutation, { isLoading: isSigningOut }] = useLogoutMutation();

  /**
   * Đăng nhập user
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await signinMutation({ email, password }).unwrap();

        console.log("response: ", response);

        if (response.statusCode === 400) {
          throw new Error("Tài khoản đang bị khóa");
        }

        if (response.statusCode === 200) {
          notify("Đăng nhập thành công!");

          // Tokens are saved as HTTP-only cookies automatically by axios
          // Mark tokens as valid in tokenManager
          await tokenManager.saveTokens("http-only-cookie", "http-only-cookie");
          console.log("[useUser] Tokens marked as valid after login");

          // Kết nối WebSocket để lắng nghe FORCE_LOGOUT
          connectWebSocketLogout(email, (isForceLogout: boolean) => {
            void signOut(isForceLogout);
          });

          return { success: true, user: response?.data };
        }

        return { success: false };
      } catch (error: any) {
        console.error("[useUser] Sign in error:", error);

        if (
          error?.status === 400 &&
          error?.data?.message === "Account is locked"
        ) {
          Alert.alert(
            "Tài khoản bị khóa",
            "Tài khoản của bạn đã bị khóa. Vui lòng kích hoạt lại.",
            [
              {
                text: "Kích hoạt ngay",
                onPress: () => {
                  router.push(`/(auth)/otp?email=${email}`);
                },
              },
              { text: "Hủy", style: "cancel" },
            ],
          );
          return { success: false, error: "Account is locked" };
        }

        if (
          error?.status === 400 &&
          error?.data?.message === "Bad credentials"
        ) {
          return { success: false, error: "Bad credentials" };
        }

        notify("Đăng nhập thất bại!");
        return { success: false };
      }
    },
    [signinMutation, router],
  );

  const handleUpdateApplicant = useCallback(
    async (formData: FormData) => {
      try {
        await updateApplicant(formData).unwrap();
        notify("Cập nhật thông tin thành công!");
        return { success: true };
      } catch (error) {
        console.error("Failed to update applicant:", error);
        notify("Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.");
        return { success: false, error };
      }
    },
    [updateApplicant],
  );

  const handleUpdateRecruiter = useCallback(
    async (formData: FormData) => {
      try {
        await updateRecruiter(formData).unwrap();
        notify("Cập nhật thông tin thành công!");
        return { success: true };
      } catch (error) {
        console.error("Failed to update recruiter:", error);
        notify("Cập nhật thất bại. Vui lòng thử lại sau.");
        return { success: false, error };
      }
    },
    [updateRecruiter],
  );

  const signOut = useCallback(
    async (isForceLogout: boolean = false) => {
      try {
        // Ngắt kết nối WebSocket lắng nghe FORCE_LOGOUT khi người dùng đăng xuất
        disconnectWebSocketLogout();

        // Nếu là FORCE_LOGOUT, backend đã xóa token rồi, không cần gọi logout API
        if (!isForceLogout) {
          await logoutMutation().unwrap();
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Clear all auth data using tokenManager (handles AsyncStorage + memory)
        await tokenManager.clearTokens();
        dispatch(clearUser());
        dispatch(api.util.resetApiState());
        notify("Đã đăng xuất");
        router.replace("/(auth)/signin");
      }
    },
    [logoutMutation, dispatch, router],
  );

  return {
    user,
    isSignedIn: isAuthenticated,

    signIn,
    handleUpdateApplicant,
    handleUpdateRecruiter,
    signOut,

    isSigningIn,
    isUpdatingApplicant,
    isUpdatingRecruiter,
    isSigningOut,
  };
}
