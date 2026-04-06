import { clearUser, useAuthSlice } from "@/lib/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import { api } from "@/services/api";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";

// Import các API services (Đảm bảo đường dẫn này khớp với project mobile của bạn)
import { useUpdateApplicantMutation } from "@/services/applicant/applicantApi";
import { useLogoutMutation } from "@/services/auth/authApi";
import { useUpdateRecruiterMutation } from "@/services/recruiter/recruiterApi";

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

  const [updateApplicant, { isLoading: isUpdatingApplicant }] =
    useUpdateApplicantMutation();
  const [updateRecruiter, { isLoading: isUpdatingRecruiter }] =
    useUpdateRecruiterMutation();
  const [logoutMutation, { isLoading: isSigningOut }] = useLogoutMutation();

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

  const signOut = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearUser());
      dispatch(api.util.resetApiState());
      notify("Đã đăng xuất");
      router.replace("/(auth)/signin");
    }
  }, [logoutMutation, dispatch, router]);

  return {
    user,
    isSignedIn: isAuthenticated,

    handleUpdateApplicant,
    handleUpdateRecruiter,
    signOut,

    isUpdatingApplicant,
    isUpdatingRecruiter,
    isSigningOut,
  };
}
