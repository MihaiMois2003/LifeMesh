// src/components/ui/posts/PostDetailContent.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeInUp, 
  FadeInDown,
  ZoomIn,
  SlideInLeft,
} from "react-native-reanimated";

import { Post } from "../../../shared/types/posts";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../../shared/constants/theme";

const { width } = Dimensions.get("window");
const IMAGE_WIDTH = width - (Spacing.xl * 2);

interface PostDetailContentProps {
  post: Post;
}

/**
 * 📝 POST DETAIL CONTENT
 * 
 * Main content section of the post detail modal containing:
 * - Post title with fade-in animation
 * - Post content/description with slide-up animation
 * - Image gallery with staggered zoom animations
 * - Location info (if available)
 * 
 * 🎨 Animation Sequence:
 * - Title fades in from top (300ms)
 * - Content slides up (400ms)
 * - Images zoom in with stagger (500ms+)
 * - Location info slides in from left (600ms)
 * 
 * 🏗️ Architecture:
 * - Pure presentation component
 * - Handles image gallery display logic
 * - Responsive image sizing
 * - Expandable content for long posts
 */
export const PostDetailContent: React.FC<PostDetailContentProps> = ({
  post,
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // ==========================================
  // 📝 CONTENT PROCESSING
  // ==========================================

  const shouldTruncateContent = post.content.length > 300;
  const displayContent = shouldTruncateContent && !showFullContent
    ? post.content.substring(0, 300).trim() + "..."
    : post.content;

  // ==========================================
  // 🖼️ IMAGE GALLERY LOGIC
  // ==========================================

  const hasImages = post.imageUrls && post.imageUrls.length > 0;
  const imageCount = post.imageUrls?.length || 0;

  const renderImageGallery = () => {
    if (!hasImages) return null;

    if (imageCount === 1) {
      // Single image - full width
      return (
        <Animated.View 
          entering={ZoomIn.delay(200).duration(250).springify()}
          style={styles.singleImageContainer}
        >
          <TouchableOpacity
            onPress={() => setSelectedImageIndex(0)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: post.imageUrls![0] }}
              style={styles.singleImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (imageCount === 2) {
      // Two images - side by side
      return (
        <View style={styles.twoImagesContainer}>
          {post.imageUrls!.slice(0, 2).map((uri, index) => (
            <Animated.View 
              key={index}
              entering={ZoomIn.delay(500 + (index * 100)).duration(600).springify()}
              style={styles.halfImageContainer}
            >
              <TouchableOpacity
                onPress={() => setSelectedImageIndex(index)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri }}
                  style={styles.halfImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      );
    }

    // Multiple images - grid layout
    return (
      <View style={styles.multipleImagesContainer}>
        {/* First image - larger */}
        <Animated.View 
          entering={ZoomIn.delay(500).duration(600).springify()}
          style={styles.primaryImageContainer}
        >
          <TouchableOpacity
            onPress={() => setSelectedImageIndex(0)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: post.imageUrls![0] }}
              style={styles.primaryImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary images */}
        <View style={styles.secondaryImagesContainer}>
          {post.imageUrls!.slice(1, 3).map((uri, index) => (
            <Animated.View 
              key={index + 1}
              entering={ZoomIn.delay(600 + (index * 100)).duration(600).springify()}
              style={styles.secondaryImageContainer}
            >
              <TouchableOpacity
                onPress={() => setSelectedImageIndex(index + 1)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri }}
                  style={styles.secondaryImage}
                  resizeMode="cover"
                />
                
                {/* Show "+X more" overlay on last image if there are more */}
                {index === 1 && imageCount > 3 && (
                  <View style={styles.moreImagesOverlay}>
                    <Text style={styles.moreImagesText}>
                      +{imageCount - 3}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  // ==========================================
  // 🎨 RENDER COMPONENT
  // ==========================================

  return (
    <View style={styles.container}>
      {/* Post Title */}
      <Animated.View 
        entering={FadeInUp.delay(300).duration(600).springify()}
        style={styles.titleContainer}
      >
        <Text style={styles.title}>
          {post.title}
        </Text>
      </Animated.View>

      {/* Post Content */}
      <Animated.View 
        entering={FadeInUp.delay(400).duration(600).springify()}
        style={styles.contentContainer}
      >
        <Text style={styles.content}>
          {displayContent}
        </Text>
        
        {/* Show More/Less Button */}
        {shouldTruncateContent && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowFullContent(!showFullContent)}
            activeOpacity={0.7}
          >
            <Text style={styles.showMoreText}>
              {showFullContent ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Image Gallery */}
      {hasImages && (
        <Animated.View 
          entering={FadeInDown.delay(500).duration(600).springify()}
          style={styles.imagesContainer}
        >
          {renderImageGallery()}
        </Animated.View>
      )}

      {/* Location Info (if available) */}
      {post.address && (
        <Animated.View 
          entering={SlideInLeft.delay(600).duration(600).springify()}
          style={styles.locationContainer}
        >
          <Ionicons
            name="location-outline"
            size={16}
            color={Colors.text.secondary}
          />
          <Text style={styles.locationText}>
            {post.address}
          </Text>
        </Animated.View>
      )}

      {/* Post Metadata */}
      <Animated.View 
        entering={FadeInUp.delay(700).duration(600).springify()}
        style={styles.metadataContainer}
      >
        <View style={styles.metadataItem}>
          <Ionicons
            name="eye-outline"
            size={14}
            color={Colors.text.tertiary}
          />
          <Text style={styles.metadataText}>
            {post.viewCount} views
          </Text>
        </View>
        
        {post.type && (
          <View style={styles.metadataItem}>
            <Ionicons
              name="document-outline"
              size={14}
              color={Colors.text.tertiary}
            />
            <Text style={styles.metadataText}>
              {post.type.toLowerCase()}
            </Text>
          </View>
        )}
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
  },

  // Title
  titleContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeights["2xl"],
  },

  // Content
  contentContainer: {
    marginBottom: Spacing.lg,
  },
  content: {
    fontSize: Typography.fontSizes.base,
    lineHeight: Typography.lineHeights.base,
    color: Colors.text.secondary,
  },
  showMoreButton: {
    marginTop: Spacing.sm,
    alignSelf: "flex-start",
  },
  showMoreText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeights.medium as any,
  },

  // Images
  imagesContainer: {
    marginBottom: Spacing.lg,
  },
  
  // Single Image
  singleImageContainer: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.md,
  },
  singleImage: {
    width: IMAGE_WIDTH,
    height: 250,
  },

  // Two Images
  twoImagesContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  halfImageContainer: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.md,
  },
  halfImage: {
    width: "100%",
    height: 200,
  },

  // Multiple Images
  multipleImagesContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  primaryImageContainer: {
    flex: 2,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.md,
  },
  primaryImage: {
    width: "100%",
    height: 200,
  },
  secondaryImagesContainer: {
    flex: 1,
    gap: Spacing.sm,
  },
  secondaryImageContainer: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    position: "relative",
    ...Shadows.sm,
  },
  secondaryImage: {
    width: "100%",
    height: "100%",
  },
  moreImagesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreImagesText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold as any,
  },

  // Location
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
  },

  // Metadata
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metadataText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.text.tertiary,
  },
});