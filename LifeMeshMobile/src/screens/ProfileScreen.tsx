// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { useAuth } from "../features/auth/hooks/useAuth";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../shared/constants/theme";

// Components
import { PentagonAvatar } from "../components/ui/PentagonAvatar";
import { AnimatedPressable } from "../components/ui/AnimatedPressable";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { SettingsScreen } from "../components/profile/SettingsScreen";
import { EditProfileModal } from "../components/profile/EditProfileModal";

const { width } = Dimensions.get("window");

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar || null
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Animation values
  const headerAnimation = useSharedValue(0);
  const avatarAnimation = useSharedValue(0);
  const buttonsAnimation = useSharedValue(0);
  const contentAnimation = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    headerAnimation.value = withTiming(1, { duration: 800 });
    avatarAnimation.value = withDelay(300, withSpring(1, { damping: 12 }));
    buttonsAnimation.value = withDelay(500, withSpring(1, { damping: 15 }));
    contentAnimation.value = withDelay(700, withTiming(1, { duration: 600 }));
  }, []);

  const handleImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need camera roll permissions to change your avatar!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while selecting the image");
    }
  };

  const handleSaveProfile = async (userData: any) => {
    // Here you would call your API to update the user profile
    console.log("Saving profile data:", userData);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setShowSettings(false);
          await logout();
        },
      },
    ]);
  };

  const handleShareProfile = () => {
    Alert.alert("Share Profile", "Share functionality coming soon!");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Animation styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerAnimation.value,
    transform: [
      {
        translateY: interpolate(
          headerAnimation.value,
          [0, 1],
          [-30, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: avatarAnimation.value,
    transform: [
      {
        scale: interpolate(
          avatarAnimation.value,
          [0, 1],
          [0.5, 1],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsAnimation.value,
    transform: [
      {
        translateY: interpolate(
          buttonsAnimation.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentAnimation.value,
    transform: [
      {
        translateY: interpolate(
          contentAnimation.value,
          [0, 1],
          [30, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const stats = [
    { label: "Posts", value: 12, icon: "📝" },
    { label: "Reputation", value: user.reputation, icon: "⭐" },
    { label: "Level", value: user.level, icon: "🏆" },
    { label: "Helped", value: 8, icon: "🤝" },
  ];

  const activities = [
    { title: "Donated old books", time: "3 days ago", type: "donation" },
    { title: "Joined community cleanup", time: "1 week ago", type: "event" },
    {
      title: "Helped with moving furniture",
      time: "2 weeks ago",
      type: "help",
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case "help":
        return Colors.primary[500];
      case "donation":
        return Colors.accent[500];
      case "event":
        return Colors.secondary[500];
      default:
        return Colors.primary[500];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        style="light"
        backgroundColor={Colors.primary[600]}
        translucent
      />

      {/* Full-height header with green background */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[700]]}
          style={styles.headerGradient}
        >
          {/* Decorative elements */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          {/* Settings button - moved much further right */}
          <AnimatedPressable
            onPress={() => setShowSettings(true)}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.white} />
          </AnimatedPressable>

          {/* Avatar positioned in center */}
          <Animated.View style={[styles.avatarInHeader, avatarAnimatedStyle]}>
            <PentagonAvatar
              imageUri={avatarUri}
              size={140}
              onPress={handleImagePicker}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* User info below avatar */}
      <Animated.View style={[styles.userInfoSection, buttonsAnimatedStyle]}>
        <Text style={styles.displayName}>
          {user.displayName || user.username}
        </Text>
        <Text style={styles.username}>@{user.username}</Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AnimatedPressable
            onPress={() => setShowEditProfile(true)}
            style={[styles.actionButton, styles.editButton]}
          >
            <Ionicons name="create-outline" size={18} color={Colors.white} />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleShareProfile}
            style={[styles.actionButton, styles.shareButton]}
          >
            <Ionicons
              name="share-outline"
              size={18}
              color={Colors.primary[600]}
            />
            <Text style={[styles.buttonText, { color: Colors.primary[600] }]}>
              Share
            </Text>
          </AnimatedPressable>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Location */}
          {user.address && (
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.primary[600]}
              />
              <Text style={styles.locationText}>{user.address}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </View>

          {/* Bio */}
          {user.bio && (
            <Card style={styles.bioCard}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </Card>
          )}

          {/* Recent Activity */}
          <Card style={styles.activityCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityDot,
                      { backgroundColor: getActivityColor(activity.type) },
                    ]}
                  />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>

          {/* Member Since */}
          <Card style={styles.joinCard}>
            <Text style={styles.joinTitle}>Member Since</Text>
            <Text style={styles.joinDate}>
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Modals */}
      <SettingsScreen
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
      />

      <EditProfileModal
        isVisible={showEditProfile}
        user={user}
        onClose={() => setShowEditProfile(false)}
        onSave={handleSaveProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },

  // Header (full height with green background to status bar)
  header: {
    height: 200,
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    paddingTop: insets.top + Spacing.md, // Account for status bar
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circle1: {
    position: "absolute",
    top: 20,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle2: {
    position: "absolute",
    bottom: -10,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  settingsButton: {
    position: "absolute",
    top: insets.top + Spacing.md,
    right: Spacing.md, // Much closer to the edge
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInHeader: {
    marginTop: Spacing.lg,
  },

  // User info section (below avatar)
  userInfoSection: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.white,
    marginTop: -20,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    ...Shadows.lg,
  },
  displayName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  username: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    minWidth: 120,
    justifyContent: "center",
    ...Shadows.md,
  },
  editButton: {
    backgroundColor: Colors.primary[600],
  },
  shareButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  buttonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.white,
    marginLeft: Spacing.xs,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    alignSelf: "center",
    ...Shadows.sm,
  },
  locationText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
  },

  // Bio
  bioCard: {
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  bioText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeights.base * 1.4,
  },

  // Activity
  activityCard: {
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[50],
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
  },

  // Join Date
  joinCard: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    ...Shadows.lg,
  },
  joinTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  joinDate: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.primary[600],
  },
});
