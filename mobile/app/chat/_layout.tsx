import { Stack } from "expo-router";
import CallRealtimeListener from "@/components/common/CallRealtimeListener";

export default function ChatLayout() {
  return (
    <>
      <CallRealtimeListener />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[id]" />
        <Stack.Screen name="detail" />
        <Stack.Screen name="create-group" />
        <Stack.Screen name="create-group-info" />
        <Stack.Screen name="add-members" />
      </Stack>
    </>
  );
}
