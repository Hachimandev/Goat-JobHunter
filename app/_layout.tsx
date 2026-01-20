import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../lib/store';
import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../lib/hooks';
import { setUser } from '../lib/authSlice';
import { useGetMyAccountQuery } from '../services/auth/authApi';
import { ActivityIndicator, View } from 'react-native';
import { tokenStorage } from '../services/tokenStorage';

// Component to check auth on app start
function AuthChecker() {
  const dispatch = useAppDispatch();
  const [hasToken, setHasToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // Check if token exists
  useEffect(() => {
    const checkToken = async () => {
      const exists = await tokenStorage.hasToken();
      setHasToken(exists);
      setCheckingToken(false);
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
        })
      );
    } else if (isError) {
      // Clear token if fetch failed
      tokenStorage.clearTokens();
    }
  }, [data, isError, dispatch]);

  // Show loading while checking
  if (checkingToken || (hasToken && isLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
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
          <Stack.Screen name="companies/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
