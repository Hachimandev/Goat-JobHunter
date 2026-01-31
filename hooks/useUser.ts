import { useAuthSlice } from "@/lib/authSlice";

export function useUser() {
  const { user, isAuthenticated } = useAuthSlice();

  return {
    user,
    isSignedIn: isAuthenticated,
  };
}
