import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Event Type for Token Changes
 * - 'TOKEN_REFRESHED': Tokens updated via refresh endpoint
 * - 'TOKENS_CLEARED': All tokens cleared (logout)
 * - 'TOKENS_SAVED': New tokens saved (login)
 */
export type TokenChangeEvent = 'TOKEN_REFRESHED' | 'TOKENS_CLEARED' | 'TOKENS_SAVED';

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

type TokenChangeListener = (event: TokenChangeEvent, tokens: TokenState) => void;

/**
 * Unified Token Manager
 * Single source of truth for token management
 * - Manages HTTP-only cookies via Axios (backend)
 * - Maintains AsyncStorage flag for persistence
 * - Provides event system for token changes
 * - Ensures atomic operations (no race conditions)
 */
class TokenManager {
  private state: TokenState = {
    accessToken: null,
    refreshToken: null,
    isLoading: false,
  };

  private listeners: Set<TokenChangeListener> = new Set();
  private refreshPromise: Promise<void> | null = null;

  /**
   * Initialize token state from AsyncStorage
   * Call this once on app startup (_layout.tsx)
   */
  async initialize(): Promise<void> {
    try {
      const hasValidToken = await AsyncStorage.getItem('@auth_token_valid');
      // Tokens are HTTP-only cookies, we only track if user has valid token
      this.state.isLoading = false;
      console.log('[TokenManager] Initialized. Has valid token:', !!hasValidToken);
    } catch (error) {
      console.error('[TokenManager] Init error:', error);
    }
  }

  /**
   * Save tokens after successful login/refresh
   * - Stores flag in AsyncStorage
   * - Updates internal memory cache
   * - HTTP-only cookies are handled by backend (via axios withCredentials)
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Atomic save: update memory first, then persist
      this.state = {
        accessToken,
        refreshToken,
        isLoading: false,
      };

      // Persist token valid flag (backend handles HTTP-only cookies)
      await AsyncStorage.setItem('@auth_token_valid', 'true');
      await AsyncStorage.setItem('@token_last_updated', new Date().toISOString());

      console.log('[TokenManager] Tokens saved. Updated at:', new Date().toISOString());

      // Notify all listeners
      this.notifyListeners('TOKENS_SAVED');
    } catch (error) {
      console.error('[TokenManager] Save tokens error:', error);
      throw error;
    }
  }

  /**
   * Get current access token from memory cache
   * Synchronous - no network calls
   */
  getAccessToken(): string | null {
    return this.state.accessToken;
  }

  /**
   * Get current refresh token from memory cache
   * Synchronous - no network calls
   */
  getRefreshToken(): string | null {
    return this.state.refreshToken;
  }

  /**
   * Check if user has valid token
   * Synchronous check from AsyncStorage flag
   */
  async hasValidToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('@auth_token_valid');
      return token === 'true';
    } catch (error) {
      console.error('[TokenManager] hasValidToken error:', error);
      return false;
    }
  }

  /**
   * Mark token refresh in progress
   * Prevents concurrent refresh calls
   */
  setRefreshing(isRefreshing: boolean): void {
    this.state.isLoading = isRefreshing;
  }

  /**
   * Get current refresh status
   */
  isRefreshing(): boolean {
    return this.state.isLoading;
  }

  /**
   * Get/Create refresh promise for queuing requests
   */
  getRefreshPromise(): Promise<void> | null {
    return this.refreshPromise;
  }

  /**
   * Set refresh promise for request queuing
   */
  setRefreshPromise(promise: Promise<void> | null): void {
    this.refreshPromise = promise;
  }

  /**
   * Clear all tokens (logout)
   * - Clears memory cache
   * - Clears AsyncStorage flag
   * - HTTP-only cookies cleared by backend on logout endpoint
   */
  async clearTokens(): Promise<void> {
    try {
      // Atomic clear: update memory first, then persist
      this.state = {
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      };

      // Clear AsyncStorage flags
      await AsyncStorage.removeItem('@auth_token_valid');
      await AsyncStorage.removeItem('@token_last_updated');

      console.log('[TokenManager] Tokens cleared');

      // Notify all listeners
      this.notifyListeners('TOKENS_CLEARED');
    } catch (error) {
      console.error('[TokenManager] Clear tokens error:', error);
      throw error;
    }
  }

  /**
   * Notify listeners when tokens change
   * Used by WebSocket to reconnect, UI to refresh, etc.
   */
  private notifyListeners(event: TokenChangeEvent): void {
    const currentState = { ...this.state };
    this.listeners.forEach((listener) => {
      try {
        listener(event, currentState);
      } catch (error) {
        console.error('[TokenManager] Listener error:', error);
      }
    });
  }

  /**
   * Subscribe to token changes
   * Returns unsubscribe function
   */
  onTokensChanged(listener: TokenChangeListener): () => void {
    this.listeners.add(listener);
    console.log('[TokenManager] Listener added. Total listeners:', this.listeners.size);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      console.log('[TokenManager] Listener removed. Total listeners:', this.listeners.size);
    };
  }

  /**
   * Get total number of listeners (for debugging)
   */
  getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Get current state (for debugging)
   */
  getState(): TokenState {
    return { ...this.state };
  }

  /**
   * Clear all listeners (rarely needed, mainly for testing)
   */
  clearListeners(): void {
    this.listeners.clear();
    console.log('[TokenManager] All listeners cleared');
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
