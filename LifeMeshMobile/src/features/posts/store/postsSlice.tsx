// src/features/posts/store/postsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Post,
  Category,
  PostStatus,
  PostSortOption,
  PostLoadingState,
  GetPostsResponse,
} from "../../../shared/types/posts";

/**
 * 🏪 POSTS REDUX SLICE
 *
 * This manages all posts-related state in your app.
 * Following the exact same pattern as your authSlice.ts
 *
 * State includes:
 * - Posts array (the actual posts)
 * - Pagination info
 * - Loading states
 * - Filters & search
 * - Current operations (creating, updating, etc.)
 */

// ==========================================
// 🏗️ STATE INTERFACE
// ==========================================

interface PostsState {
  // ✅ Posts Data
  posts: Post[]; // Array of posts for the feed
  myPosts: Post[]; // User's own posts (for profile)

  // ✅ Pagination State
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPosts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  // ✅ Filter & Search State
  filters: {
    category?: Category;
    search?: string;
    sortBy: PostSortOption;
  };

  // ✅ Loading States (following your auth pattern)
  isLoading: boolean; // General loading (like fetching posts)
  isCreating: boolean; // Creating a new post
  isUpdating: boolean; // Updating an existing post
  isDeleting: boolean; // Deleting a post

  // ✅ Error Handling
  error: string | null;

  // ✅ UI State
  selectedPost: Post | null; // For post detail view
  refreshing: boolean; // For pull-to-refresh
}

// ==========================================
// 📊 INITIAL STATE
// ==========================================

const initialState: PostsState = {
  // Posts data
  posts: [],
  myPosts: [],

  // Pagination (default values)
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalPosts: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  // Filters
  filters: {
    sortBy: "newest", // Default sort
  },

  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error state
  error: null,

  // UI state
  selectedPost: null,
  refreshing: false,
};

// ==========================================
// 🎛️ REDUX SLICE
// ==========================================

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // ==========================================
    // 📄 FETCH POSTS ACTIONS
    // ==========================================

    /**
     * Start fetching posts (show loading)
     */
    fetchPostsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Successfully fetched posts
     */
    fetchPostsSuccess: (state, action: PayloadAction<GetPostsResponse>) => {
      state.isLoading = false;
      state.posts = action.payload.posts;
      state.pagination = action.payload.pagination;
      state.filters = { ...state.filters, ...action.payload.filters };
      state.error = null;
    },

    /**
     * Failed to fetch posts
     */
    fetchPostsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ==========================================
    // 📄 LOAD MORE POSTS (Infinite Scroll)
    // ==========================================

    /**
     * Load more posts for infinite scroll
     */
    loadMorePostsSuccess: (state, action: PayloadAction<GetPostsResponse>) => {
      // Append new posts to existing ones
      state.posts = [...state.posts, ...action.payload.posts];
      state.pagination = action.payload.pagination;
      state.isLoading = false;
    },

    // ==========================================
    // ✏️ CREATE POST ACTIONS
    // ==========================================

    /**
     * Start creating a post
     */
    createPostStart: (state) => {
      state.isCreating = true;
      state.error = null;
    },

    /**
     * Successfully created a post
     */
    createPostSuccess: (state, action: PayloadAction<Post>) => {
      state.isCreating = false;
      // Add new post to the beginning of the array (newest first)
      state.posts = [action.payload, ...state.posts];
      state.myPosts = [action.payload, ...state.myPosts];
      state.error = null;
    },

    /**
     * Failed to create a post
     */
    createPostFailure: (state, action: PayloadAction<string>) => {
      state.isCreating = false;
      state.error = action.payload;
    },

    // ==========================================
    // 🔄 UPDATE POST ACTIONS
    // ==========================================

    /**
     * Start updating a post
     */
    updatePostStart: (state) => {
      state.isUpdating = true;
      state.error = null;
    },

    /**
     * Successfully updated a post
     */
    updatePostSuccess: (state, action: PayloadAction<Post>) => {
      state.isUpdating = false;
      const updatedPost = action.payload;

      // Update post in main posts array
      state.posts = state.posts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      );

      // Update post in myPosts array
      state.myPosts = state.myPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      );

      // Update selected post if it's the same one
      if (state.selectedPost?.id === updatedPost.id) {
        state.selectedPost = updatedPost;
      }

      state.error = null;
    },

    /**
     * Failed to update a post
     */
    updatePostFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.error = action.payload;
    },

    // ==========================================
    // 🗑️ DELETE POST ACTIONS
    // ==========================================

    /**
     * Start deleting a post
     */
    deletePostStart: (state) => {
      state.isDeleting = true;
      state.error = null;
    },

    /**
     * Successfully deleted a post
     */
    deletePostSuccess: (state, action: PayloadAction<string>) => {
      state.isDeleting = false;
      const deletedPostId = action.payload;

      // Remove post from main posts array
      state.posts = state.posts.filter((post) => post.id !== deletedPostId);

      // Remove post from myPosts array
      state.myPosts = state.myPosts.filter((post) => post.id !== deletedPostId);

      // Clear selected post if it was deleted
      if (state.selectedPost?.id === deletedPostId) {
        state.selectedPost = null;
      }

      state.error = null;
    },

    /**
     * Failed to delete a post
     */
    deletePostFailure: (state, action: PayloadAction<string>) => {
      state.isDeleting = false;
      state.error = action.payload;
    },

    // ==========================================
    // 🔍 FILTER & SEARCH ACTIONS
    // ==========================================

    /**
     * Update category filter
     */
    setCategoryFilter: (state, action: PayloadAction<Category | undefined>) => {
      state.filters.category = action.payload;
      // Reset pagination when filter changes
      state.pagination.currentPage = 1;
    },

    /**
     * Update search query
     */
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      // Reset pagination when search changes
      state.pagination.currentPage = 1;
    },

    /**
     * Update sort option
     */
    setSortBy: (state, action: PayloadAction<PostSortOption>) => {
      state.filters.sortBy = action.payload;
      // Reset pagination when sort changes
      state.pagination.currentPage = 1;
    },

    /**
     * Clear all filters
     */
    clearFilters: (state) => {
      state.filters = {
        sortBy: "newest", // Keep default sort
      };
      state.pagination.currentPage = 1;
    },

    // ==========================================
    // 🎯 UI STATE ACTIONS
    // ==========================================

    /**
     * Select a post for detail view
     */
    selectPost: (state, action: PayloadAction<Post>) => {
      state.selectedPost = action.payload;
    },

    /**
     * Clear selected post
     */
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },

    /**
     * Start refresh (pull-to-refresh)
     */
    startRefresh: (state) => {
      state.refreshing = true;
      state.error = null;
    },

    /**
     * End refresh
     */
    endRefresh: (state) => {
      state.refreshing = false;
    },

    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Reset all posts state (useful for logout)
     */
    resetPostsState: () => initialState,

    // ==========================================
    // 👤 MY POSTS ACTIONS
    // ==========================================

    /**
     * Set user's own posts (for profile screen)
     */
    setMyPosts: (state, action: PayloadAction<Post[]>) => {
      state.myPosts = action.payload;
    },

    // ==========================================
    // 👍 ENGAGEMENT ACTIONS (For Future Use)
    // ==========================================

    /**
     * Update post engagement (likes, views, etc.)
     * This will be useful when you implement voting
     */
    updatePostEngagement: (
      state,
      action: PayloadAction<{
        postId: string;
        upvotes?: number;
        downvotes?: number;
        viewCount?: number;
      }>
    ) => {
      const { postId, upvotes, downvotes, viewCount } = action.payload;

      // Update in main posts array
      state.posts = state.posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            ...(upvotes !== undefined && { upvotes }),
            ...(downvotes !== undefined && { downvotes }),
            ...(viewCount !== undefined && { viewCount }),
          };
        }
        return post;
      });

      // Update in myPosts array
      state.myPosts = state.myPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            ...(upvotes !== undefined && { upvotes }),
            ...(downvotes !== undefined && { downvotes }),
            ...(viewCount !== undefined && { viewCount }),
          };
        }
        return post;
      });

      // Update selected post if needed
      if (state.selectedPost?.id === postId) {
        state.selectedPost = {
          ...state.selectedPost,
          ...(upvotes !== undefined && { upvotes }),
          ...(downvotes !== undefined && { downvotes }),
          ...(viewCount !== undefined && { viewCount }),
        };
      }
    },
  },
});

// ==========================================
// 📤 EXPORT ACTIONS
// ==========================================

export const {
  // Fetch posts
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  loadMorePostsSuccess,

  // Create post
  createPostStart,
  createPostSuccess,
  createPostFailure,

  // Update post
  updatePostStart,
  updatePostSuccess,
  updatePostFailure,

  // Delete post
  deletePostStart,
  deletePostSuccess,
  deletePostFailure,

  // Filters & search
  setCategoryFilter,
  setSearchFilter,
  setSortBy,
  clearFilters,

  // UI state
  selectPost,
  clearSelectedPost,
  startRefresh,
  endRefresh,
  clearError,
  resetPostsState,

  // My posts
  setMyPosts,

  // Engagement
  updatePostEngagement,
} = postsSlice.actions;

// ==========================================
// 📤 EXPORT REDUCER
// ==========================================

export default postsSlice.reducer;
