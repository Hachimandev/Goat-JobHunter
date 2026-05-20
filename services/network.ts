import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PATH = "/api/v1";
const BACKEND_PORT = "5000";
const LOCALHOST_PATTERN = /^(localhost|127\.0\.0\.1)$/i;

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  return typeof hostUri === "string" ? hostUri.split(":")[0] : null;
};

const normalizeAndroidLocalhost = (url: string) => {
  try {
    const parsedUrl = new URL(url);

    if (
      Platform.OS === "android" &&
      LOCALHOST_PATTERN.test(parsedUrl.hostname)
    ) {
      parsedUrl.hostname = "10.0.2.2";
    }

    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
};

const getDefaultApiUrl = () => {
  const expoHost = getExpoHost();

  if (__DEV__ && expoHost) {
    return `http://${expoHost}:${BACKEND_PORT}${API_PATH}`;
  }

  return `http://localhost:${BACKEND_PORT}${API_PATH}`;
};

export const API_BASE_URL = normalizeAndroidLocalhost(
  process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl(),
);

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  API_BASE_URL.replace(/\/api\/v\d+$/, "/ws");
