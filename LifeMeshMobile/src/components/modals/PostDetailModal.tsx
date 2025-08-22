// src/components/modals/PostDetailModal.tsx
import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing
} from "react-native-reanimated";

import { Post } from "../../shared/types/posts";
import { PostDetailHeader } from "../ui/posts/PostDetailHeader";
import { PostDetailContent } from "../ui/posts/PostDetailContent";
import { PostDetailActions } from "../ui/posts/PostDetailActions";
import {
  Colors,
  BorderRadius,
  Shadows,
  Spacing,
} from "../../shared/constants/theme";

const { height, width } = Dimensions.get("window");

interface PostDetailModalProps {
  visible: boolean;
  post: Post | null;
  currentUserId?: string;
  isCurrentUserAdmin?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

/**
 * 🎭 POST DETAIL MODAL
 * 
 * A beautiful, animated modal that shows post details.
 * 
 * 🎨 Animation Sequence:
 * 1. Backdrop fades in (300ms)
 * 2. Modal slides up with spring animation (600ms)
 * 3. Content animates in with staggered delays
 * 
 * 🏗️ Architecture:
 * - Container component that orchestrates child components
 * - Each section (header, content, actions) is a separate component
 * - Handles all modal lifecycle and animations
 */
export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  visible,
  post,
  currentUserId,
  isCurrentUserAdmin = false,
  onClose,
  onEdit,
  onDelete,
  onLike,
  onComment,
  onShare,
  isLiked = false,
}) => {
  const insets = useSafeAreaInsets();

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(height);
  const contentOpacity = useSharedValue(0);

    // Check if user can modify this post (boolean | undefined)
  const canModify =
    post ? (currentUserId === post.authorId || isCurrentUserAdmin) : undefined;

  // ==========================================
  // 🎬 ANIMATION CHOREOGRAPHY
  // ==========================================

  useEffect(() => {
    if (visible && post) {
      // Show modal animation sequence
      animateIn();
    } else if (!visible) {
      // Hide modal animation sequence
      animateOut();
    }
  }, [visible, post]);

  const animateIn = () => {
  // Reset values
  backdropOpacity.value = 0;
  modalTranslateY.value = height;
  contentOpacity.value = 0;

  // Sequence: backdrop → modal → content
  backdropOpacity.value = withTiming(1, { duration: 120 });

  modalTranslateY.value = withTiming(
    0,
    { duration: 180, easing: Easing.out(Easing.cubic) }, // smooth slide up
    (finished) => {
      if (finished) {
        contentOpacity.value = withTiming(1, { duration: 100 });
      }
    }
  );
};

const animateOut = () => {
  // Reverse sequence: content → modal → backdrop
  contentOpacity.value = withTiming(0, { duration: 80 });

  modalTranslateY.value = withTiming(
    height,
    { duration: 180, easing: Easing.in(Easing.cubic) } // smooth slide down
  );

  backdropOpacity.value = withTiming(0, { duration: 120 });
};



  // ==========================================
  // 🎭 ANIMATED STYLES
  // ==========================================

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // ==========================================
  // 🚀 EVENT HANDLERS
  // ==========================================

  const handleBackdropPress = () => {
    onClose();
  };

  const handleEditPress = () => {
    if (onEdit) {
      console.log("🔧 Edit post:", post?.id);
      onEdit();
    }
  };

  const handleDeletePress = () => {
    if (onDelete) {
      console.log("🗑️ Delete post:", post?.id);
      onDelete();
    }
  };

  // Don't render anything if not visible or no post
  if (!visible || !post) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      </Animated.View>

      {/* Modal Container */}
      <Animated.View style={[styles.modalContainer, modalStyle]}>
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          {/* Animated Content */}
          <Animated.View style={[styles.content, contentStyle]}>
            {/* Header - Author info + actions */}
            <PostDetailHeader
              post={post}
              canModify={canModify}
              onClose={onClose}
              onEdit={handleEditPress}
              onDelete={handleDeletePress}
            />

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* Post Content */}
              <PostDetailContent post={post} />

              {/* Actions - likes, comments, etc. */}
              <PostDetailActions
                post={post}
                isLiked={isLiked}
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
              />

              {/* Bottom spacing for safe area */}
              <View style={{ height: insets.bottom + Spacing.xl }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>
    </>
  );
};

// ==========================================
// 🎨 STYLES
// ==========================================

const styles = StyleSheet.create({
  // Backdrop
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 9998,
  },
  backdropTouchable: {
    flex: 1,
  },

  // Modal
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    height: height * 0.9, // 90% of screen height
    ...Shadows.xl,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
});