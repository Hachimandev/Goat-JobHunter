import { NotificationProvider } from "@/components/notification/NotificationProvider";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { clearUser, setUser } from "../lib/authSlice";
import { resetPendingNotifications } from "../lib/chatNotificationSlice";
import { useAppDispatch } from "../lib/hooks";
import { persistor, store } from "../lib/store";
import { tokenManager } from "../lib/tokenManager";
import { useGetMyAccountQuery } from "../services/auth/authApi";
import {
    connectWebSocketLogout,
    disconnectWebSocketLogout,
} from "../services/WebSocketLogoutService";

// Component to check auth on app start
function AuthChecker() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // Initialize notification manager globally
  useNotificationManager({ enabled: true, checkInterval: 3000 });

  // Check if token exists
  useEffect(() => {
    const checkToken = async () => {
      // Initialize tokenManager (load token state from AsyncStorage)
      await tokenManager.initialize();

      const exists = await tokenManager.hasValidToken();
      setHasToken(exists);
      setCheckingToken(false);

      // Log tokenManager state for debugging
      const state = tokenManager.getState();
      console.log("[TokenManager] Initialized at app start:", {
        isLoading: state.isLoading,
        listenerCount: tokenManager.getListenerCount(),
      });
    };
    checkToken();
  }, []);

  // Fetch account if token exists
  const { data, isLoading, isError } = useGetMyAccountQuery(undefined, {
    skip: !hasToken,
  });

  useEffect(() => {
    if (data?.data && !isError) {
      // Update Redux state with user data
      dispatch(
        setUser({
          user: data.data,
          roles: data.data.role ? [data.data.role.name] : [],
        }),
      );
      // Reset pending notifications to avoid showing old notifications from persist state
      dispatch(resetPendingNotifications());
    } else if (isError) {
      // Clear token if fetch failed
      tokenManager.clearTokens().catch((error) => {
        console.error("Error clearing tokens:", error);
      });
    }
  }, [data, isError, dispatch]);

  // Connect WebSocket logout listener when user is authenticated
  // This handles force logout on app startup (auto-login scenario)
  useEffect(() => {
    if (data?.data && data.data.email) {
      console.log(
        "[AuthChecker] User authenticated, connecting WebSocket logout listener",
      );

      const handleForceLogout = async (isForceLogout: boolean) => {
        console.log("[AuthChecker] Force logout triggered from WebSocket");

        try {
          disconnectWebSocketLogout();
          dispatch(resetPendingNotifications());
          await tokenManager.clearTokens();
          dispatch(clearUser());
          router.replace("/(auth)/signin");
        } catch (error) {
          console.error("[AuthChecker] Error handling force logout:", error);
        }
      };

      // Connect WebSocket with user email
      connectWebSocketLogout(data.data.email, handleForceLogout);

      // Return cleanup function to disconnect on unmount
      return () => {
        console.log(
          "[AuthChecker] Disconnecting WebSocket logout listener on unmount",
        );
        disconnectWebSocketLogout();
      };
    }
  }, [data?.data, dispatch, router]);

  // Show loading while checking
  if (checkingToken || (hasToken && isLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthChecker />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="jobs/[id]" options={{ headerShown: false }} />
            <Stack.Screen
              name="companies/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
          <NotificationProvider />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
