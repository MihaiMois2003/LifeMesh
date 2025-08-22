// src/components/ui/posts/PostCard.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";
import { Post, CATEGORY_INFO } from "../../../shared/types/posts";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - Spacing.xl * 2;

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  isLiked?: boolean;
  animationDelay?: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onAuthorPress,
  onLikePress,
  onCommentPress,
  onSharePress,
  isLiked = false,
  animationDelay = 0,
}) => {
  const categoryInfo = CATEGORY_INFO[post.category];

  // Format time ago (simple implementation)
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(animationDelay).duration(600).springify()}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.98}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Author Info */}
          <TouchableOpacity
  style={styles.authorSection}
  onPress={onAuthorPress}
  activeOpacity={0.7}
>
  <View style={styles.avatar}>
    {post.author.avatar ? (
      <Image
        source={{ uri: post.author.avatar }}
        style={styles.avatarImage}
        resizeMode="cover"
      />
    ) : (
      <Text style={styles.avatarText}>
        {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
      </Text>
    )}
  </View>
  <View style={styles.authorInfo}>
    <View style={styles.authorNameContainer}>
      <Text style={styles.authorName}>
        {post.author.displayName || post.author.username}
      </Text>
      {post.author.isVerified && (
        <Ionicons
          name="checkmark-circle"
          size={14}
          color={Colors.accent[500]}
          style={{ marginLeft: 4 }}
        />
      )}
    </View>
    <Text style={styles.username}>
      @{post.author.username}
    </Text>
    <Text style={styles.timeAgo}>
      {formatTimeAgo(post.createdAt)}
    </Text>
  </View>
</TouchableOpacity>

          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryInfo.color + "20" },
            ]}
          >
            <Ionicons
              name={categoryInfo.icon as any}
              size={14}
              color={categoryInfo.color}
            />
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.label}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {truncateContent(post.content)}
          </Text>
        </View>

        {/* Images */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <View style={styles.imagesContainer}>
            {post.imageUrls.length === 1 ? (
              <Image
                source={{ uri: post.imageUrls[0] }}
                style={styles.singleImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.multipleImages}>
                <Image
                  source={{ uri: post.imageUrls[0] }}
                  style={styles.primaryImage}
                  resizeMode="cover"
                />
                {post.imageUrls.length > 1 && (
                  <View style={styles.secondaryImages}>
                    <Image
                      source={{ uri: post.imageUrls[1] }}
                      style={styles.secondaryImage}
                      resizeMode="cover"
                    />
                    {post.imageUrls.length > 2 && (
                      <View style={styles.moreImagesOverlay}>
                        <Text style={styles.moreImagesText}>
                          +{post.imageUrls.length - 2}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onLikePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? Colors.social.like : Colors.text.secondary}
            />
            <Text
              style={[
                styles.actionText,
                isLiked && { color: Colors.social.like },
              ]}
            >
              {post.upvotes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onCommentPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={Colors.text.secondary}
            />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onSharePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-outline"
              size={18}
              color={Colors.text.secondary}
            />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          {/* Views */}
          <View style={styles.viewsContainer}>
            <Ionicons
              name="eye-outline"
              size={16}
              color={Colors.text.tertiary}
            />
            <Text style={styles.viewsText}>{post.viewCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold as any,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: Typography.fontSizes.sm,
  fontWeight: Typography.fontWeights.semibold as any,
  color: Colors.text.primary,
  },
  avatarImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
},
authorNameContainer: {
  flexDirection: "row",
  alignItems: "center",
},
username: {
  fontSize: Typography.fontSizes.xs,
  color: Colors.text.tertiary,
  marginTop: 2,
},
  timeAgo: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  categoryText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium as any,
  },

  // Content
  content: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeights.lg,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeights.base,
  },

  // Images
  imagesContainer: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  singleImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
  },
  multipleImages: {
    flexDirection: "row",
    height: 150,
    gap: 4,
  },
  primaryImage: {
    flex: 2,
    borderRadius: BorderRadius.md,
  },
  secondaryImages: {
    flex: 1,
    position: "relative",
  },
  secondaryImage: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
  },
  moreImagesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  moreImagesText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold as any,
  },

  // Actions
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeights.medium as any,
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  viewsText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
  },
});
