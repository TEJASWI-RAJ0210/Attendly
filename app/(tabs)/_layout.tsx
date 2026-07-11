import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Today", tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="weekly"
        options={{ title: "Weekly", tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="attendance"
        options={{ title: "Attendance", tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="planner"
        options={{ title: "Planner", tabBarIcon: ({ color, size }) => <Ionicons name="checkbox-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
