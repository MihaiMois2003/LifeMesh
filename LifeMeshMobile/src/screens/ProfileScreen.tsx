// src/screens/ProfileScreen.tsx (Updated with avatar upload)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withTiming,
  withDelay,
  FadeInUp,
  FadeInDown,
} from "react-native-reanimated";

import { useAuth } from "../features/auth/hooks/useAuth";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../shared/constants/theme";

// Profile-specific components
import { ProfileHeader } from "../components/ui/profile/ProfileHeader";
import { ProfileStats } from "../components/ui/profile/ProfileStats";
import { ProfileBio } from "../components/ui/profile/ProfileBio";
import { ProfileActivity } from "../components/ui/profile/ProfileActivity";
import { ProfileActions } from "../components/ui/profile/ProfileActions";
import { EditProfileModal } from "../components/profile/EditProfileModal";
import { SettingsScreen } from "../components/profile/SettingsScreen";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 280;
const COMPACT_HEADER_HEIGHT = 100;

export const ProfileScreen = () => {
  const { user, token, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true); // 🆕 Add this missing state

  const authToken = token;
  // Scroll animation
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  useEffect(() => {
    // Initial fade-in animation
    headerOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    console.log("🔑 Token from Redux:", token ? "exists" : "not found");
    console.log("🔑 Full token value:", token);
  }, [token]);

  // 🆕 Handle avatar update
  const handleAvatarUpdate = (newAvatarUrl: string) => {
    console.log("🔄 Avatar updated:", newAvatarUrl);
    if (user && updateUser) {
      updateUser({
        ...user,
        avatar: newAvatarUrl,
      });
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [1, 0],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -50],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const compactHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 80, HEADER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 80, HEADER_HEIGHT],
      [-20, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const handleUpdateProfile = async (userData: Partial<any>) => {
    // 🔄 Update profile via API
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/me`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const result = await response.json();

      if (result.success && updateUser) {
        updateUser(result.data);
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  if (!user || !tokenLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <Text style={styles.loadingText}>
          {!user ? "Loading profile..." : "Loading authentication..."}
        </Text>
      </View>
    );
  }

  const stats = [
    { label: "Posts", value: 24, icon: "document-text-outline" },
    { label: "Helped", value: user.reputation, icon: "heart-outline" },
    { label: "Level", value: user.level, icon: "trophy-outline" },
    { label: "Friends", value: 18, icon: "people-outline" },
  ];

  const activities = [
    {
      id: "1",
      type: "help",
      title: "Helped neighbor with groceries",
      time: "2 hours ago",
      icon: "bag-outline",
      color: Colors.success,
    },
    {
      id: "2",
      type: "post",
      title: "Shared local event information",
      time: "1 day ago",
      icon: "megaphone-outline",
      color: Colors.primary[600],
    },
    {
      id: "3",
      type: "donation",
      title: "Donated old books to library",
      time: "3 days ago",
      icon: "book-outline",
      color: Colors.accent[600],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background.primary} />

      {/* Compact Header (shows on scroll) */}
      <Animated.View style={[styles.compactHeader, compactHeaderStyle]}>
        <View style={[styles.compactContent, { paddingTop: insets.top }]}>
          <View style={styles.compactLeft}>
            <View style={styles.compactAvatar}>
              <Text style={styles.compactAvatarText}>
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.compactName}>
              {user.displayName || user.username}
            </Text>
          </View>
          <ProfileActions
            onEdit={() => setShowEditModal(true)}
            onSettings={() => setShowSettingsModal(true)}
            variant="compact"
          />
        </View>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Main Header */}
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <ProfileHeader
            user={user}
            onEdit={() => setShowEditModal(true)}
            onSettings={() => setShowSettingsModal(true)}
            onAvatarUpdate={handleAvatarUpdate} // 🆕 Pass avatar update handler
            authToken={authToken} // 🆕 Pass auth token
            style={{ paddingTop: insets.top }}
          />
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Stats */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            style={styles.statsContainer}
          >
            <ProfileStats stats={stats} />
          </Animated.View>

          {/* Bio */}
          {user.bio && (
            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              style={styles.bioContainer}
            >
              <ProfileBio bio={user.bio} />
            </Animated.View>
          )}

          {/* Recent Activity */}
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={styles.activityContainer}
          >
            <ProfileActivity activities={activities} />
          </Animated.View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isVisible={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateProfile}
      />

      {/* Settings Modal */}
      <SettingsScreen
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onLogout={logout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeights.medium as any,
  },

  // Compact Header
  compactHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: COMPACT_HEADER_HEIGHT,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
    zIndex: 10,
    ...Shadows.sm,
  },
  compactContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  compactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  compactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  compactAvatarText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold as any,
  },
  compactName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.text.primary,
  },

  // Main Content
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
  },
  contentContainer: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    marginTop: -30,
    paddingTop: Spacing["2xl"],
    minHeight: height - HEADER_HEIGHT + 50,
    ...Shadows.lg,
  },

  // Content sections
  statsContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  bioContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  activityContainer: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
});
