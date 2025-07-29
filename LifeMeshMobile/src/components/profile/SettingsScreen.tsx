// src/components/profile/SettingsScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../shared/constants/theme";
import { Card } from "../ui/Card";
import { AnimatedPressable } from "../ui/AnimatedPressable";

const { width, height } = Dimensions.get("window");

interface SettingsScreenProps {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isVisible,
  onClose,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();

  // Animation values
  const slideAnimation = useSharedValue(0);
  const overlayAnimation = useSharedValue(0);
  const contentAnimation = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      overlayAnimation.value = withTiming(1, { duration: 300 });
      slideAnimation.value = withSpring(1, { damping: 15 });
      contentAnimation.value = withDelay(200, withTiming(1, { duration: 400 }));
    } else {
      contentAnimation.value = withTiming(0, { duration: 200 });
      slideAnimation.value = withTiming(0, { duration: 300 });
      overlayAnimation.value = withDelay(100, withTiming(0, { duration: 200 }));
    }
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
    pointerEvents: isVisible ? "auto" : "none",
  }));

  const slideStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      slideAnimation.value,
      [0, 1],
      [height, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const opacity = contentAnimation.value;
    const translateY = interpolate(
      contentAnimation.value,
      [0, 1],
      [20, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          title: "Privacy Settings",
          subtitle: "Manage your privacy preferences",
          icon: "shield-outline",
          onPress: () => console.log("Privacy Settings"),
        },
        {
          title: "Notifications",
          subtitle: "Configure notification preferences",
          icon: "notifications-outline",
          onPress: () => console.log("Notifications"),
        },
        {
          title: "Location Settings",
          subtitle: "Manage location sharing",
          icon: "location-outline",
          onPress: () => console.log("Location Settings"),
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          title: "Blocked Users",
          subtitle: "Manage blocked users",
          icon: "ban-outline",
          onPress: () => console.log("Blocked Users"),
        },
        {
          title: "Safety Center",
          subtitle: "Community guidelines and safety",
          icon: "checkmark-circle-outline",
          onPress: () => console.log("Safety Center"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          title: "Help & Support",
          subtitle: "Get help and contact support",
          icon: "help-circle-outline",
          onPress: () => console.log("Help & Support"),
        },
        {
          title: "Report a Problem",
          subtitle: "Report bugs or issues",
          icon: "bug-outline",
          onPress: () => console.log("Report a Problem"),
        },
        {
          title: "About LifeMesh",
          subtitle: "App information and credits",
          icon: "information-circle-outline",
          onPress: () => console.log("About LifeMesh"),
        },
      ],
    },
  ];

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <StatusBar style="dark" backgroundColor="rgba(0,0,0,0.5)" />

      <Animated.View style={[styles.container, slideStyle]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
          <AnimatedPressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </AnimatedPressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={contentStyle}>
            {settingsGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Card style={styles.groupCard}>
                  {group.items.map((item, index) => (
                    <AnimatedPressable
                      key={index}
                      onPress={item.onPress}
                      style={[
                        styles.settingItem,
                        index < group.items.length - 1 &&
                          styles.settingItemBorder,
                      ]}
                    >
                      <View style={styles.settingLeft}>
                        <View style={styles.iconContainer}>
                          <Ionicons
                            name={item.icon as any}
                            size={22}
                            color={Colors.primary[600]}
                          />
                        </View>
                        <View style={styles.settingText}>
                          <Text style={styles.settingTitle}>{item.title}</Text>
                          <Text style={styles.settingSubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.text.tertiary}
                      />
                    </AnimatedPressable>
                  ))}
                </Card>
              </View>
            ))}

            {/* Logout Button */}
            <AnimatedPressable onPress={onLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </AnimatedPressable>

            {/* App Version */}
            <Text style={styles.versionText}>LifeMesh v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    marginTop: 50,
    ...Shadows.xl,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },
  groupContainer: {
    marginBottom: Spacing.xl,
  },
  groupTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  groupCard: {
    marginHorizontal: Spacing.xl,
    ...Shadows.lg,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[50],
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.error,
    ...Shadows.md,
  },
  logoutText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },

  // Version
  versionText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
});
