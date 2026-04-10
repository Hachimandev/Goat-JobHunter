import { clearUser, useAuthSlice } from '@/lib/features/authSlice';
import { useAppDispatch } from '@/lib/hooks';
import { useUpdateApplicantMutation } from '@/services/applicant/applicantApi';
import {
  useCompanySignUpMutation,
  useLogoutMutation,
  useResendCodeMutation,
  useSigninMutation,
  useUserSignUpMutation,
  useVerifyCodeMutation,
} from '@/services/auth/authApi';
import { SignInRequest, VerifyCodeRequest } from '@/services/auth/authType';
import { useCreateUserMutation, useResetPasswordMutation, useUpdatePasswordMutation } from '@/services/user/userApi';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useUpdateRecruiterMutation } from '@/services/recruiter/recruiterApi';
import { TUserSignUpSchema } from '@/app/(auth)/components/schemas';
import { api } from '@/services/api';
import { useUpdateCompanyMutation } from '@/services/company/companyApi';

export function useUser() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAuthSlice();

  // API mutations
  const [signinMutation, { isLoading: isSigningIn }] = useSigninMutation();
  const [userSignUpMutation, { isLoading: isSigningUp }] = useUserSignUpMutation();
  const [companySignUpMutation, { isLoading: isSigningUpCompany }] = useCompanySignUpMutation();
  const [logoutMutation, { isLoading: isSigningOut }] = useLogoutMutation();
  const [verifyCodeMutation, { isLoading: isVerifying }] = useVerifyCodeMutation();
  const [resendCodeMutation, { isLoading: isResending }] = useResendCodeMutation();
  const [updatePasswordMutation, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();
  const [resetPassword, { isLoading: isReseting }] = useResetPasswordMutation();
  const [updateApplicant, { isLoading: isUpdatingApplicant }] = useUpdateApplicantMutation();
  const [updateRecruiter, { isLoading: isUpdatingRecruiter }] = useUpdateRecruiterMutation();
  const [createUserMutation, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateCompany, { isLoading: isUpdatingCompany }] = useUpdateCompanyMutation();

  /**
   * Create new user action (admin only)
   */
  const handleCreateUser = useCallback(
    async (data: {
      email: string;
      role: string;
      fullName?: string;
      username?: string;
      phone?: string;
      address?: string;
    }) => {
      try {
        const response = await createUserMutation({
          email: data.email,
          role: data.role,
          fullName: data.fullName,
          username: data.username,
          phone: data.phone,
          address: data.address,
        }).unwrap();

        if (response.statusCode === 201 || response.statusCode === 200) {
          toast.success('Tạo người dùng thành công!');
          return { success: true, data: response.data };
        }

        toast.error('Tạo người dùng thất bại!');
        return { success: false };
      } catch (error) {
        console.error('Failed to create user:', error);

        // @ts-expect-error Handle API error
        if (error.status === 409) {
          toast.error('Email đã tồn tại trong hệ thống!');
          return { success: false, error: 'Email already exists' };
        }

        toast.error('Tạo người dùng thất bại!');
        return { success: false };
      }
    },
    [createUserMutation],
  );

  /**
   * Sign in user
   */
  const signIn = useCallback(
    async (params: SignInRequest) => {
      try {
        const response = await signinMutation(params).unwrap();

        if (response.statusCode === 400) {
          throw new Error('Tài khoản đang bị khóa');
        }

        if (response.statusCode === 200) {
          toast.success('Đăng nhập thành công!');
          return { success: true, user: response?.data };
        }

        return { success: false };
      } catch (error) {
        console.error('error signin:', error);

        // @ts-expect-error ts-ignore
        if (error.status === 400 && error.data.message == 'Account is locked') {
          toast('Tài khoản của bạn đã bị khóa. Vui lòng kích hoạt lại.', {
            action: {
              label: 'Kích hoạt ngay',
              onClick: () => {
                router.push('/otp?email=' + params.email);
              },
            },
          });
          return { success: false, error: 'Account is locked' };
        }

        // @ts-expect-error ts-ignore
        if (error.status === 400 && error.data.message == 'Bad credentials') {
          return { success: false, error: 'Bad credentials' };
        }

        toast.error('Đăng nhập thất bại!');
        return { success: false };
      }
    },
    [signinMutation, router],
  );

  /**
   * Sign up new user (applicant or recruiter)
   */
  const userSignUp = useCallback(
    async (params: TUserSignUpSchema) => {
      try {
        const response = await userSignUpMutation(params).unwrap();

        if (response.statusCode === 201) {
          toast.success('Đăng ký thành công!');
          return { success: true, type: params.type };
        }
        return { success: false };
      } catch (error) {
        console.error('error sign up:', error);
        toast.error('Đăng ký thất bại!');
        return { success: false };
      }
    },
    [userSignUpMutation],
  );

  /**
   * Sign up new company
   */
  const companySignUp = useCallback(
    async (params: FormData) => {
      try {
        const response = await companySignUpMutation(params).unwrap();

        if (response.statusCode === 201) {
          toast.success('Đăng ký thành công!');
          return { success: true, type: 'company' };
        }
        return { success: false };
      } catch (error) {
        console.error('error sign up:', error);
        toast.error('Đăng ký thất bại!');
        return { success: false };
      }
    },
    [companySignUpMutation],
  );

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      await logoutMutation().unwrap();

      // Clear Redux state
      dispatch(clearUser());

      // Clear all RTK Query cache
      dispatch(api.util.resetApiState());

      toast.success('Đăng xuất thành công!');
      router.push('/');

      return { success: true };
    } catch (error) {
      dispatch(clearUser());
      dispatch(api.util.resetApiState());
      router.push('/');

      console.error('error sign out:', error);
      return { success: false };
    }
  }, [logoutMutation, dispatch, router]);

  /**
   * Verify email code
   */
  const verifyCode = useCallback(
    async (params: VerifyCodeRequest) => {
      try {
        const response = await verifyCodeMutation(params).unwrap();

        if (response.statusCode === 200) {
          toast.success('Xác thực email thành công!');
          return { success: true };
        }

        toast.error('Mã xác thực không đúng!');
        return { success: false, error: 'Invalid code' };
      } catch (error) {
        console.error('error verify code:', error);
        toast.error('Xác thực thất bại!');
        return { success: false };
      }
    },
    [verifyCodeMutation],
  );

  /**
   * Resend verification code
   */
  const resendCode = useCallback(
    async (email: string) => {
      try {
        await resendCodeMutation({ email }).unwrap();
        toast.success('Đã gửi lại mã xác thực!');
        return { success: true };
      } catch (error) {
        console.error('error resend code:', error);
        toast.error('Gửi lại mã thất bại!');
        return { success: false };
      }
    },
    [resendCodeMutation],
  );

  /**
   * Update password (for logged-in users)
   */
  const updatePassword = useCallback(
    async (params: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
      try {
        const response = await updatePasswordMutation({
          currentPassword: params.oldPassword,
          newPassword: params.newPassword,
          rePassword: params.confirmPassword,
        }).unwrap();

        if (response.statusCode === 200) {
          toast.success('Cập nhật mật khẩu thành công!');
          return { success: true };
        }

        toast.error('Mật khẩu cũ không đúng!');
        return { success: false, error: 'Invalid old password' };
      } catch (error) {
        console.error('error update password:', error);

        // @ts-expect-error ts-ignore
        if (error.status === 400) {
          toast.error('Mật khẩu cũ không đúng!');
          return { success: false, error: 'Invalid old password' };
        }

        toast.error('Cập nhật mật khẩu thất bại!');
        return { success: false };
      }
    },
    [updatePasswordMutation],
  );

  /**
   * Reset password (for forgotten password)
   */
  const handleResetPassword = useCallback(
    async ({ email, newPassword }: { email: string; newPassword: string }) => {
      try {
        const response = await resetPassword({
          email,
          newPassword,
        }).unwrap();

        if (response.statusCode === 200) {
          toast.success('Đặt lại mật khẩu thành công!');
          return { success: true };
        }

        toast.error('Email không tồn tại!');
        return { success: false, error: 'Email not found' };
      } catch (error) {
        console.error('error reset password:', error);

        // @ts-expect-error ts-ignore
        if (error.status === 404) {
          toast.error('Email không tồn tại!');
          return { success: false, error: 'Email not found' };
        }

        toast.error('Đặt lại mật khẩu thất bại!');
        return { success: false };
      }
    },
    [resetPassword],
  );

  /**
   * Update applicant information
   */
  const handleUpdateApplicant = useCallback(
    async (formData: FormData) => {
      try {
        const response = await updateApplicant(formData);

        if (response.error) {
          toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
          return;
        }

        toast.success('Cập nhật thông tin thành công!');
      } catch (error) {
        console.error('Failed to update applicant:', error);
        toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
      }
    },
    [updateApplicant],
  );

  /**
   * Update recruiter information
   */
  const handleUpdateRecruiter = useCallback(
    async (formData: FormData) => {
      try {
        const response = await updateRecruiter(formData);

        if (response.error) {
          toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
          return;
        }

        toast.success('Cập nhật thông tin thành công!');
      } catch (error) {
        console.error('Failed to update recruiter:', error);
        toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
      }
    },
    [updateRecruiter],
  );

  /**
   * Update company information
   */
  const handleUpdateCompany = useCallback(
    async (formData: FormData) => {
      try {
        const response = await updateCompany(formData);

        if (response.error) {
          toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
          return;
        }

        toast.success('Cập nhật thông tin thành công!');
      } catch (error) {
        console.error('Failed to update company:', error);
        toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
      }
    },
    [updateCompany],
  );

  return {
    // User data
    user,
    isSignedIn: isAuthenticated,

    // Auth methods
    signIn,
    userSignUp,
    companySignUp,
    signOut,
    verifyCode,
    resendCode,
    updatePassword,
    handleResetPassword,

    // Loading states
    isSigningIn,
    isSigningUp,
    isSigningUpCompany,
    isSigningOut,
    isVerifying,
    isResending,
    isReseting,
    isUpdatingPassword,

    // Update user info
    handleUpdateApplicant,
    isUpdatingApplicant,

    // Update recruiter
    handleUpdateRecruiter,
    isUpdatingRecruiter,

    // Update company
    handleUpdateCompany,
    isUpdatingCompany,

    // Create user (admin)
    handleCreateUser,
    isCreatingUser,
  };
}
