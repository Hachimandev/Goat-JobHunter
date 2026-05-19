import { Stack } from "expo-router";
import React from "react";

export default function CallLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="active-call" />
      <Stack.Screen
        name="incoming-call"
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
    </Stack>
  );
}
