import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Icon } from "react-native-paper";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1976d2",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e7eb",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Việc làm",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💼</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: "Công ty",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏢</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: "Blog",
          tabBarIcon: ({ color }) => (
            <Icon
              color={color}
              size={24}
              source={"newspaper-variant-outline"}
            ></Icon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
