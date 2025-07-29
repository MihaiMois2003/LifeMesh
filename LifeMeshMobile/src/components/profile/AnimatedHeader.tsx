// src/components/profile/AnimatedHeader.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Colors, Typography, Spacing } from "../../shared/constants/theme";
import { AnimatedPressable } from "../ui/AnimatedPressable";
import { PentagonAvatar } from "../ui/PentagonAvatar";

const { width } = Dimensions.get("window");

interface AnimatedHeaderProps {
  user: {
    displayName?: string | null;
    username: string;
    avatar?: string | null;
    address?: string | null;
  };
  onSettingsPress: () => void;
  onAvatarPress: () => void;
}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  user,
  onSettingsPress,
  onAvatarPress,
}) => {
  // Animation values
  const headerAnimation = useSharedValue(0);
  const avatarAnimation = useSharedValue(0);
  const textAnimation = useSharedValue(0);
  const settingsAnimation = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    headerAnimation.value = withTiming(1, { duration: 800 });
    avatarAnimation.value = withDelay(300, withSpring(1, { damping: 12 }));
    textAnimation.value = withDelay(500, withTiming(1, { duration: 600 }));
    settingsAnimation.value = withDelay(700, withSpring(1, { damping: 15 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      headerAnimation.value,
      [0, 1],
      [-50, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: headerAnimation.value,
      transform: [{ translateY }],
    };
  });

  const avatarAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      avatarAnimation.value,
      [0, 1],
      [0.3, 1],
      Extrapolate.CLAMP
    );

    const rotate = interpolate(
      avatarAnimation.value,
      [0, 1],
      [180, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: avatarAnimation.value,
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      textAnimation.value,
      [0, 1],
      [30, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: textAnimation.value,
      transform: [{ translateY }],
    };
  });

  const settingsAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      settingsAnimation.value,
      [0, 1],
      [50, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: settingsAnimation.value,
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View style={[styles.container, headerAnimatedStyle]}>
      <LinearGradient
        colors={[Colors.primary[400], Colors.primary[600], Colors.primary[800]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {/* Settings button */}
        <Animated.View
          style={[styles.settingsContainer, settingsAnimatedStyle]}
        >
          <AnimatedPressable
            onPress={onSettingsPress}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.white} />
          </AnimatedPressable>
        </Animated.View>

        {/* Avatar */}
        <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
          <PentagonAvatar
            imageUri={user.avatar}
            size={120}
            onPress={onAvatarPress}
          />
        </Animated.View>

        {/* User info */}
        <Animated.View style={[styles.userInfo, textAnimatedStyle]}>
          <Text style={styles.displayName}>
            {user.displayName || user.username}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.address && (
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.primary[100]}
              />
              <Text style={styles.locationText}>{user.address}</Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  // Decorative elements
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 100,
  },
  circle1: {
    width: 120,
    height: 120,
    top: -20,
    right: -40,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: 20,
    left: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 40,
    left: 30,
  },

  // Settings button
  settingsContainer: {
    position: "absolute",
    top: 50,
    right: Spacing.xl,
    zIndex: 10,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Avatar
  avatarContainer: {
    marginBottom: Spacing.lg,
  },

  // User info
  userInfo: {
    alignItems: "center",
  },
  displayName: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.xs,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  username: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[100],
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  locationText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary[100],
    marginLeft: Spacing.xs,
  },
});
