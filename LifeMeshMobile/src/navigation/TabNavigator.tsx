// src/navigation/TabNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing } from "../shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import { ProfileScreen } from "../screens/ProfileScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { EmulatorFriendlyMap as MapScreen } from "../screens/EmulatorFriendlyMap";

// Placeholder screens
const ChatScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>💬 Chat Screen</Text>
    <Text style={styles.placeholderSubtext}>(Coming Soon)</Text>
  </View>
);

const NotificationsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>🔔 Notifications Screen</Text>
    <Text style={styles.placeholderSubtext}>(Coming Soon)</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Map":
              iconName = focused ? "map" : "map-outline";
              break;
            case "Chat":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "Notifications":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "home-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.primary[100],
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSizes.xs,
          fontWeight: Typography.fontWeights.medium as any,
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={FeedScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xl,
  },
  placeholderText: {
    fontSize: Typography.fontSizes["3xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  placeholderSubtext: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
