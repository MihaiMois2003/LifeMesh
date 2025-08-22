// src/components/ui/posts/PostDetailActions.tsx (UPDATED FOR LIKES)
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  BounceIn,
} from "react-native-reanimated";

import { Post } from "../../../shared/types/posts";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

interface PostDetailActionsProps {
  post: Post;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

/**
 * 👍 POST DETAIL ACTIONS (UPDATED FOR LIKES)
 * 
 * Bottom action section of the post detail modal containing:
 * - Engagement metrics (likes, views, comments)
 * - Action buttons (like, comment, share)
 * - Social interaction indicators
 * 
 * 🎨 Animation Sequence:
 * - Metrics slide in from left (400ms)
 * - Like button bounces in (500ms)
 * - Comment button slides from bottom (600ms)
 * - Share button slides from right (700ms)
 * 
 * 🏗️ Architecture:
 * - Pure component with callback props
 * - Handles visual feedback for interactions
 * - Responsive button sizing
 * - Accessible touch targets
 * 
 * 🔄 UPDATED: Now uses likeCount instead of upvotes/downvotes
 */
export const PostDetailActions: React.FC<PostDetailActionsProps> = ({
  post,
  isLiked = false,
  onLike,
  onComment,
  onShare,
}) => {

  // ==========================================
  // 📊 ENGAGEMENT CALCULATIONS (UPDATED)
  // ==========================================

  const totalEngagement = post.likeCount + post.viewCount; // 🔄 CHANGED: Now uses likeCount
  const likePercentage = totalEngagement > 0 
    ? Math.round((post.likeCount / totalEngagement) * 100) // 🔄 CHANGED: Now uses likeCount
    : 0;

  // Format large numbers (1.2K, 5.3M, etc.)
  const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  // ==========================================
  // 🎨 RENDER COMPONENT
  // ==========================================

  return (
    <View style={styles.container}>
      
      {/* Engagement Metrics */}
      <Animated.View 
        entering={SlideInLeft.delay(150).duration(280).springify()}
        style={styles.metricsContainer}
      >
        {/* Likes & Views Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {formatNumber(post.likeCount)} {/* 🔄 CHANGED: Now uses likeCount */}
            </Text>
            <Text style={styles.statLabel}>
              {post.likeCount === 1 ? 'like' : 'likes'} {/* 🔄 CHANGED: Now uses likeCount */}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {formatNumber(post.viewCount)}
            </Text>
            <Text style={styles.statLabel}>
              {post.viewCount === 1 ? 'view' : 'views'}
            </Text>
          </View>

          {/* Show engagement percentage if meaningful */}
          {likePercentage > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {likePercentage}%
                </Text>
                <Text style={styles.statLabel}>liked</Text>
              </View>
            </>
          )}
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        
        {/* Like Button */}
        <Animated.View 
          entering={BounceIn.delay(500).duration(800)}
          style={styles.actionButtonContainer}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              isLiked && styles.likedButton,
            ]}
            onPress={onLike}
            activeOpacity={0.8}
            disabled={!onLike}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? Colors.white : Colors.social.like}
            />
            <Text 
              style={[
                styles.actionText,
                isLiked && styles.likedText,
              ]}
            >
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Comment Button */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(600).springify()}
          style={styles.actionButtonContainer}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onComment}
            activeOpacity={0.8}
            disabled={!onComment}
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={Colors.social.comment}
            />
            <Text style={styles.actionText}>
              Comment
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Share Button */}
        <Animated.View 
          entering={SlideInRight.delay(700).duration(600).springify()}
          style={styles.actionButtonContainer}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShare}
            activeOpacity={0.8}
            disabled={!onShare}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={Colors.social.share}
            />
            <Text style={styles.actionText}>
              Share
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Future: Comments Preview Section */}
      <Animated.View 
        entering={FadeInUp.delay(800).duration(600).springify()}
        style={styles.commentsPreviewContainer}
      >
        <TouchableOpacity
          style={styles.commentsPreview}
          onPress={onComment}
          activeOpacity={0.7}
          disabled={!onComment}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={16}
            color={Colors.text.tertiary}
          />
          <Text style={styles.commentsPreviewText}>
            View all comments
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.text.tertiary}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Interaction Hint */}
      <Animated.View 
        entering={FadeInUp.delay(900).duration(600).springify()}
        style={styles.hintContainer}
      >
        <Text style={styles.hintText}>
          Tap heart to like • Tap comment to engage
        </Text>
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
    borderTopWidth: 1,
    borderTopColor: Colors.secondary[100],
  },

  // Metrics Section
  metricsContainer: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.secondary[200],
    marginHorizontal: Spacing.sm,
  },

  // Actions Section
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  actionButtonContainer: {
    flex: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary[200],
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  likedButton: {
    backgroundColor: Colors.social.like,
    borderColor: Colors.social.like,
  },
  actionText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.primary,
  },
  likedText: {
    color: Colors.white,
  },

  // Comments Preview
  commentsPreviewContainer: {
    marginBottom: Spacing.md,
  },
  commentsPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  commentsPreviewText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.tertiary,
    flex: 1,
    textAlign: "center",
  },

  // Hint
  hintContainer: {
    alignItems: "center",
  },
  hintText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
    textAlign: "center",
    fontStyle: "italic",
  },
});