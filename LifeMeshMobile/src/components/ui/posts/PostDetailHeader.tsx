// src/components/ui/posts/PostDetailHeader.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeInLeft, 
  FadeInRight, 
  FadeInDown 
} from "react-native-reanimated";

import { Post } from "../../../shared/types/posts";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../../shared/constants/theme";

interface PostDetailHeaderProps {
  post: Post;
  canModify?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * 📋 POST DETAIL HEADER
 * 
 * Top section of the post detail modal containing:
 * - Author avatar, name, username, verification badge
 * - Post timestamp and category
 * - Action buttons (close, edit, delete)
 * 
 * 🎨 Animation Sequence:
 * - Author info slides in from left (300ms)
 * - Action buttons slide in from right (400ms) 
 * - Category badge fades in from top (500ms)
 * 
 * 🏗️ Architecture:
 * - Pure component with no side effects
 * - Receives all data via props
 * - Delegates actions to parent via callbacks
 */
export const PostDetailHeader: React.FC<PostDetailHeaderProps> = ({
  post,
  canModify = false,
  onClose,
  onEdit,
  onDelete,
}) => {
  
  // ==========================================
  // 🕒 TIME FORMATTING
  // ==========================================
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // ==========================================
  // 🎨 RENDER COMPONENT
  // ==========================================

  return (
    <View style={styles.container}>
      {/* Main Header Row */}
      <View style={styles.headerRow}>
        
        {/* Left Side - Author Information */}
        <Animated.View 
          entering={FadeInLeft.delay(200).duration(600).springify()}
          style={styles.authorSection}
        >
          {/* Author Avatar */}
          <View style={styles.avatarContainer}>
            {post.author.avatar ? (
              <Image
                source={{ uri: post.author.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(post.author.displayName || post.author.username)
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Author Details */}
          <View style={styles.authorInfo}>
            {/* Name Row */}
            <View style={styles.nameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {post.author.displayName || post.author.username}
              </Text>
              
              {/* Verification Badge */}
              {post.author.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.accent[500]}
                  style={styles.verifiedIcon}
                />
              )}
            </View>

            {/* Username */}
            <Text style={styles.username} numberOfLines={1}>
              @{post.author.username}
            </Text>

            {/* Timestamp */}
            <Text style={styles.timestamp}>
              {formatTimeAgo(post.createdAt)}
            </Text>
          </View>
        </Animated.View>

        {/* Right Side - Action Buttons */}
        <Animated.View 
          entering={FadeInRight.delay(100).duration(200).springify()}
          style={styles.actionsSection}
        >
          {/* Edit Button (if user can modify) */}
          {canModify && onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.text.secondary}
              />
            </TouchableOpacity>
          )}

          {/* Delete Button (if user can modify) */}
          {canModify && onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors.error}
              />
            </TouchableOpacity>
          )}

          {/* Close Button (always present) */}
          <TouchableOpacity
            style={[styles.actionButton, styles.closeButton]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Category Badge */}
      <Animated.View 
        entering={FadeInDown.delay(400).duration(600).springify()}
        style={styles.categoryContainer}
      >
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {post.category.replace('_', ' ')}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[100],
  },

  // Header Row
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  // Author Section (Left Side)
  authorSection: {
    flexDirection: "row",
    flex: 1,
    marginRight: Spacing.md,
  },
  avatarContainer: {
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold as any,
  },
  authorInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  authorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: Spacing.xs,
  },
  username: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
  },

  // Actions Section (Right Side)
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: Colors.error + "10",
  },
  closeButton: {
    backgroundColor: Colors.secondary[200],
  },

  // Category Section
  categoryContainer: {
    marginTop: Spacing.md,
    alignItems: "flex-start",
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.primary[700],
    textTransform: "capitalize",
  },
});