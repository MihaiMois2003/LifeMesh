// src/components/ui/profile/ProfileHeader.tsx (Updated)
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../../shared/constants/theme";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileActions } from "./ProfileActions";

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  address: string | null;
  reputation: number;
  level: number;
  isVerified: boolean;
}

interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
  onSettings: () => void;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  authToken?: string | null;
  style?: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEdit,
  onSettings,
  onAvatarUpdate,
  authToken,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[700], Colors.primary[800]]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header Actions */}
      <View style={styles.headerActions}>
        <ProfileActions
          onEdit={onEdit}
          onSettings={onSettings}
          variant="header"
        />
      </View>

      {/* Profile Content */}
      <View style={styles.profileContent}>
        {/* Avatar */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.avatarContainer}
        >
          <ProfileAvatar
            imageUri={user.avatar}
            size={120}
            showOnlineStatus={true}
            showEditButton={true}
            onAvatarUpdate={onAvatarUpdate}
            authToken={authToken || undefined} // Convert null to undefined
          />
        </Animated.View>

        {/* User Info */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.userInfo}
        >
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>
              {user.displayName || user.username}
            </Text>
            {user.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.accent[500]}
                style={styles.verifiedIcon}
              />
            )}
          </View>

          <Text style={styles.username}>@{user.username}</Text>

          {user.address && (
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.primary[200]}
              />
              <Text style={styles.locationText}>{user.address}</Text>
            </View>
          )}

          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={14} color={Colors.accent[600]} />
            <Text style={styles.levelText}>Level {user.level}</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    position: "relative",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Header Actions
  headerActions: {
    position: "absolute",
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
  },

  // Profile Content
  profileContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
  },
  userInfo: {
    alignItems: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  displayName: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.white,
    textAlign: "center",
  },
  verifiedIcon: {
    marginLeft: Spacing.xs,
  },
  username: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary[200],
    marginBottom: Spacing.sm,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary[100],
    marginLeft: Spacing.xs,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  levelText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold as any,
    color: Colors.white,
  },
});
