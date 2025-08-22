// src/screens/FeedScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";

import { usePosts } from "../features/posts/hooks/usePosts";
import { PostCard } from "../components/ui/posts/PostCard";
import { CreatePostModal } from "../components/modals/CreatePostModal";
import { Post, Category } from "../shared/types/posts";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../shared/constants/theme";

export const FeedScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    posts,
    isLoading,
    refreshing,
    hasMorePosts,
    error,
    fetchPosts,
    loadMorePosts,
    refreshPosts,
    clearPostsError,
  } = usePosts();

  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(1);
  const fabScale = useSharedValue(1);

  useEffect(() => {
    // Initial load
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    const result = await fetchPosts();
    if (!result.success) {
      showError(result.error || "Failed to load posts");
    }
  };

  const handleRefresh = useCallback(async () => {
    const result = await refreshPosts();
    if (!result.success) {
      showError(result.error || "Failed to refresh posts");
    }
  }, [refreshPosts]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePosts || isLoading) return;

    const result = await loadMorePosts();
    if (!result.success) {
      showError(result.error || "Failed to load more posts");
    }
  }, [hasMorePosts, isLoading, loadMorePosts]);

  const showError = (message: string) => {
    Alert.alert("Error", message, [{ text: "OK", onPress: clearPostsError }]);
  };

  const handlePostPress = (post: Post) => {
    // Navigate to post detail (implement later)
    console.log("Post pressed:", post.id);
  };

  const handleAuthorPress = (authorId: string) => {
    // Navigate to author profile (implement later)
    console.log("Author pressed:", authorId);
  };

  const handleLikePress = (post: Post) => {
    // Implement like functionality (future)
    console.log("Like pressed:", post.id);

    // Animate FAB
    fabScale.value = withSpring(0.9, { duration: 100 }, () => {
      fabScale.value = withSpring(1, { duration: 200 });
    });
  };

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Filter categories for display
  const categories = [
    { key: undefined, label: "All", icon: "apps-outline" },
    { key: Category.HELP_REQUEST, label: "Help", icon: "hand-right-outline" },
    { key: Category.EVENT, label: "Events", icon: "calendar-outline" },
    { key: Category.DONATION, label: "Donations", icon: "gift-outline" },
    { key: Category.SOCIAL, label: "Social", icon: "people-outline" },
  ];

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item)}
      onAuthorPress={() => handleAuthorPress(item.authorId)}
      onLikePress={() => handleLikePress(item)}
      animationDelay={index * 100}
    />
  );

  const renderCategoryFilter = () => (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600)}
      style={styles.categoryContainer}
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.key || "all"}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(item.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon as any}
              size={16}
              color={
                selectedCategory === item.key
                  ? Colors.white
                  : Colors.text.secondary
              }
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item.key &&
                  styles.categoryButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, headerStyle]}>
      <View style={[styles.headerContent, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>LifeMesh</Text>
          <Text style={styles.headerSubtitle}>Community Feed</Text>
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
          <Ionicons
            name="search-outline"
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInUp.delay(400).duration(800)}
      style={styles.emptyContainer}
    >
      <Ionicons
        name="chatbubbles-outline"
        size={80}
        color={Colors.text.tertiary}
      />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share something with your community!
      </Text>
    </Animated.View>
  );

  const renderLoadingFooter = () => {
    if (!isLoading || posts.length === 0) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={Colors.primary[600]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background.primary} />

      {/* Header */}
      {renderHeader()}

      {/* Category Filters */}
      {renderCategoryFilter()}

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary[600]]}
            tintColor={Colors.primary[600]}
            title="Pull to refresh"
            titleColor={Colors.text.secondary}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderLoadingFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.emptyListContent,
        ]}
        bounces={true}
      />

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, fabStyle]}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            console.log("FAB pressed");
            setShowCreateModal(true);
          }}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Loading Overlay */}
      {isLoading && posts.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },

  // Header
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
    ...Shadows.sm,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSizes["2xl"],
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Category Filters
  categoryContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[100],
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[600],
  },
  categoryButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium as any,
    color: Colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },

  // List
  listContent: {
    paddingTop: Spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingFooter: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold as any,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeights.base,
  },

  // FAB
  fabContainer: {
    position: "absolute",
    right: Spacing.xl,
    bottom: Spacing.xl + 80, // Above tab bar
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
  },

  // Loading Overlay
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
});
