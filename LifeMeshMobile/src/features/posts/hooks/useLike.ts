// src/features/posts/hooks/useLike.ts (CREATE THIS NEW FILE)
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { LikeService } from '../services/likeService';
import { LikeStatus } from '../../../shared/types/posts';

/**
 * 👍 USE LIKE HOOK
 * 
 * Custom hook that manages like functionality for posts
 * Provides optimistic updates, error handling, and loading states
 * 
 * 🚀 Features:
 * - Optimistic UI updates (instant feedback)
 * - Error handling with rollback
 * - Loading states
 * - Automatic retry logic
 * - Toast notifications
 * 
 * 🎯 Usage:
 * const { isLiking, toggleLike } = useLike(post.id, post.likeCount, post.isLikedByCurrentUser);
 */

interface UseLikeProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked?: boolean;
  onLikeChange?: (likeStatus: LikeStatus) => void; // Callback to update parent state
}

interface UseLikeReturn {
  likeCount: number;
  isLiked: boolean;
  isLiking: boolean;
  toggleLike: () => Promise<void>;
  refreshLikeStatus: () => Promise<void>;
}

export const useLike = ({
  postId,
  initialLikeCount,
  initialIsLiked = false,
  onLikeChange,
}: UseLikeProps): UseLikeReturn => {
  
  // ==========================================
  // 🏪 STATE MANAGEMENT
  // ==========================================
  
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLiking, setIsLiking] = useState(false);

  // ==========================================
  // 👍 TOGGLE LIKE FUNCTION
  // ==========================================
  
  const toggleLike = useCallback(async () => {
    if (isLiking) return; // Prevent multiple simultaneous requests

    // Store original state for rollback
    const originalLikeCount = likeCount;
    const originalIsLiked = isLiked;

    try {
      setIsLiking(true);

      // ==========================================
      // 🚀 OPTIMISTIC UPDATE (Instant UI feedback)
      // ==========================================
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
      
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      // Notify parent component immediately
      if (onLikeChange) {
        onLikeChange({
          isLiked: newIsLiked,
          likeCount: newLikeCount,
        });
      }

      console.log(`📱 Optimistic update: ${newIsLiked ? 'liked' : 'unliked'} post ${postId}`);

      // ==========================================
      // 🌐 API CALL
      // ==========================================
      const response = await LikeService.toggleLike(postId);

      // ==========================================
      // ✅ SUCCESS - Update with server response
      // ==========================================
      const serverLikeStatus = response.data.likeStatus;
      
      setIsLiked(serverLikeStatus.isLiked);
      setLikeCount(serverLikeStatus.likeCount);

      // Update parent with server data
      if (onLikeChange) {
        onLikeChange(serverLikeStatus);
      }

      console.log(`✅ Server confirmed: ${response.data.action} post ${postId}`);
      console.log(`📊 Final counts: ${serverLikeStatus.likeCount} likes, isLiked: ${serverLikeStatus.isLiked}`);

    } catch (error: any) {
      console.error('❌ Like toggle failed:', error.message);

      // ==========================================
      // 🔄 ROLLBACK OPTIMISTIC UPDATE
      // ==========================================
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);

      // Rollback parent state
      if (onLikeChange) {
        onLikeChange({
          isLiked: originalIsLiked,
          likeCount: originalLikeCount,
        });
      }

      // ==========================================
      // 🚨 ERROR HANDLING
      // ==========================================
      let errorMessage = 'Failed to update like';
      
      if (error.message.includes('log in')) {
        errorMessage = 'Please log in to like posts';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Post not found';
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage = 'Network error. Please check your connection';
      }

      // Show user-friendly error
      Alert.alert('Oops!', errorMessage, [
        { text: 'OK' },
        // Optional retry button for network errors
        ...(error.message.includes('network') ? [
          { text: 'Retry', onPress: () => setTimeout(toggleLike, 1000) }
        ] : [])
      ]);
    } finally {
      setIsLiking(false);
    }
  }, [postId, likeCount, isLiked, isLiking, onLikeChange]);

  // ==========================================
  // 🔄 REFRESH LIKE STATUS
  // ==========================================
  
  const refreshLikeStatus = useCallback(async () => {
    try {
      console.log(`🔄 Refreshing like status for post ${postId}`);
      
      const response = await LikeService.getLikeStatus(postId);
      const serverLikeStatus = response.data.likeStatus;
      
      setIsLiked(serverLikeStatus.isLiked);
      setLikeCount(serverLikeStatus.likeCount);

      // Update parent
      if (onLikeChange) {
        onLikeChange(serverLikeStatus);
      }

      console.log(`✅ Like status refreshed: ${serverLikeStatus.likeCount} likes, isLiked: ${serverLikeStatus.isLiked}`);
      
    } catch (error: any) {
      console.error('❌ Failed to refresh like status:', error.message);
      // Don't show error for refresh failures - it's not critical
    }
  }, [postId, onLikeChange]);

  // ==========================================
  // 📤 RETURN INTERFACE
  // ==========================================
  
  return {
    likeCount,
    isLiked,
    isLiking,
    toggleLike,
    refreshLikeStatus,
  };
};

// ==========================================
// 🎯 USAGE EXAMPLES
// ==========================================

/*

// Example 1: Basic usage in PostCard
const PostCard = ({ post }) => {
  const { likeCount, isLiked, isLiking, toggleLike } = useLike({
    postId: post.id,
    initialLikeCount: post.likeCount,
    initialIsLiked: post.isLikedByCurrentUser,
  });

  return (
    <TouchableOpacity 
      onPress={toggleLike} 
      disabled={isLiking}
      style={[styles.likeButton, isLiking && styles.loading]}
    >
      <Icon name={isLiked ? "heart" : "heart-outline"} />
      <Text>{likeCount}</Text>
    </TouchableOpacity>
  );
};

// Example 2: With parent state updates
const FeedScreen = () => {
  const [posts, setPosts] = useState([]);

  const updatePostLikes = (postId: string, likeStatus: LikeStatus) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likeCount: likeStatus.likeCount, isLikedByCurrentUser: likeStatus.isLiked }
          : post
      )
    );
  };

  return posts.map(post => (
    <PostCardWithLikes 
      key={post.id} 
      post={post} 
      onLikeChange={(likeStatus) => updatePostLikes(post.id, likeStatus)}
    />
  ));
};

*/