import { Tabs } from "expo-router";
import { Briefcase, Building, Newspaper, MessageCircle, User } from "lucide-react-native";

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
          height: 80,
          paddingBottom: 25,
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
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: "Công ty",
          tabBarIcon: ({ color, size }) => (
            <Building size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: "Blog",
          tabBarIcon: ({ color, size }) => (
            <Newspaper size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
