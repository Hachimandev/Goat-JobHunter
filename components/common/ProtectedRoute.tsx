import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/lib/hooks';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * ProtectedRoute Component
 * Bảo vệ các màn hình yêu cầu authentication
 * Redirect đến signin nếu user chưa đăng nhập
 */
export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, roles } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    // Kiểm tra authentication
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to signin...');
      router.replace('/(auth)/signin');
      return;
    }

    // Kiểm tra roles nếu có yêu cầu
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => roles.includes(role));
      
      if (!hasRequiredRole) {
        console.log('User does not have required role, redirecting to home...');
        router.replace('/');
        return;
      }
    }

    setIsChecking(false);
  }, [isAuthenticated, user, roles, requiredRoles, router]);

  // Show loading while checking
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Render children if authenticated and has required roles
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

