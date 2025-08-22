// src/features/posts/hooks/usePosts.ts
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  loadMorePostsSuccess,
  createPostStart,
  createPostSuccess,
  createPostFailure,
  updatePostStart,
  updatePostSuccess,
  updatePostFailure,
  deletePostStart,
  deletePostSuccess,
  deletePostFailure,
  setCategoryFilter,
  setSearchFilter,
  setSortBy,
  clearFilters,
  selectPost,
  clearSelectedPost,
  startRefresh,
  endRefresh,
  clearError,
  setMyPosts,
  updatePostEngagement,
} from "../store/postsSlice";
import { postsService } from "../services/postsService";
import {
  CreatePostRequest,
  GetPostsRequest,
  UpdatePostRequest,
  Category,
  PostSortOption,
} from "../../../shared/types/posts";

export const usePosts = () => {
  const dispatch = useAppDispatch();
  const postsState = useAppSelector((state) => state.posts);

  // Get current auth token
  const authToken = useAppSelector((state) => state.auth.token);

  // === FETCH POSTS ===

  /**
   * Fetch posts with current filters and pagination
   */
  const fetchPosts = async (options: GetPostsRequest = {}) => {
    try {
      dispatch(fetchPostsStart());

      // Use current state filters if not provided
      const requestOptions = {
        page: 1, // Always start from page 1 for fresh fetch
        pageSize: postsState.pagination.pageSize,
        category: postsState.filters.category,
        search: postsState.filters.search,
        sortBy: postsState.filters.sortBy,
        ...options, // Override with provided options
      };

      const response = await postsService.getPosts(requestOptions);
      dispatch(fetchPostsSuccess(response));

      return { success: true, data: response };
    } catch (error: any) {
      dispatch(fetchPostsFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  /**
   * Load more posts for infinite scroll
   */
  const loadMorePosts = async () => {
    try {
      if (!postsState.pagination.hasNextPage || postsState.isLoading) {
        return { success: false, error: "No more posts to load" };
      }

      dispatch(fetchPostsStart());

      const requestOptions: GetPostsRequest = {
        page: postsState.pagination.currentPage + 1,
        pageSize: postsState.pagination.pageSize,
        category: postsState.filters.category,
        search: postsState.filters.search,
        sortBy: postsState.filters.sortBy,
      };

      const response = await postsService.getPosts(requestOptions);
      dispatch(loadMorePostsSuccess(response));

      return { success: true, data: response };
    } catch (error: any) {
      dispatch(fetchPostsFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  /**
   * Refresh posts (pull-to-refresh)
   */
  const refreshPosts = async () => {
    try {
      dispatch(startRefresh());

      const requestOptions: GetPostsRequest = {
        page: 1,
        pageSize: postsState.pagination.pageSize,
        category: postsState.filters.category,
        search: postsState.filters.search,
        sortBy: postsState.filters.sortBy,
      };

      const response = await postsService.getPosts(requestOptions);
      dispatch(fetchPostsSuccess(response));
      dispatch(endRefresh());

      return { success: true };
    } catch (error: any) {
      dispatch(fetchPostsFailure(error.message));
      dispatch(endRefresh());
      return { success: false, error: error.message };
    }
  };

  // === CREATE POST ===

  /**
   * Create a new post with optional images
   */
  const createPost = async (postData: CreatePostRequest) => {
    try {
      if (!authToken) {
        throw new Error("Authentication required");
      }

      dispatch(createPostStart());

      const createdPost = await postsService.createPost(postData, authToken);
      dispatch(createPostSuccess(createdPost));

      return { success: true, data: createdPost };
    } catch (error: any) {
      dispatch(createPostFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  // === UPDATE POST ===

  /**
   * Update an existing post
   */
  const updatePost = async (postId: string, updateData: UpdatePostRequest) => {
    try {
      if (!authToken) {
        throw new Error("Authentication required");
      }

      dispatch(updatePostStart());

      const updatedPost = await postsService.updatePost(
        postId,
        updateData,
        authToken
      );
      dispatch(updatePostSuccess(updatedPost));

      return { success: true, data: updatedPost };
    } catch (error: any) {
      dispatch(updatePostFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  // === DELETE POST ===

  /**
   * Delete a post
   */
  const deletePost = async (postId: string) => {
    try {
      if (!authToken) {
        throw new Error("Authentication required");
      }

      dispatch(deletePostStart());

      await postsService.deletePost(postId, authToken);
      dispatch(deletePostSuccess(postId));

      return { success: true };
    } catch (error: any) {
      dispatch(deletePostFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  // === MY POSTS ===

  /**
   * Fetch current user's posts
   */
  const fetchMyPosts = async (options: GetPostsRequest = {}) => {
    try {
      dispatch(fetchPostsStart());

      const posts = await postsService.getMyPosts(options);
      dispatch(setMyPosts(posts));

      return { success: true, data: posts };
    } catch (error: any) {
      dispatch(fetchPostsFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  // === FILTERS & SEARCH ===

  /**
   * Set category filter and refresh posts
   */
  const setCategoryFilterAndRefresh = async (category?: Category) => {
    dispatch(setCategoryFilter(category));
    return await fetchPosts();
  };

  /**
   * Set search filter and refresh posts
   */
  const setSearchFilterAndRefresh = async (search: string) => {
    dispatch(setSearchFilter(search));
    return await fetchPosts();
  };

  /**
   * Set sort option and refresh posts
   */
  const setSortByAndRefresh = async (sortBy: PostSortOption) => {
    dispatch(setSortBy(sortBy));
    return await fetchPosts();
  };

  /**
   * Clear all filters and refresh posts
   */
  const clearFiltersAndRefresh = async () => {
    dispatch(clearFilters());
    return await fetchPosts();
  };

  // === POST DETAIL ===

  /**
   * Fetch and select a specific post for detail view
   */
  const fetchPostById = async (postId: string) => {
    try {
      const post = await postsService.getPostById(postId);
      dispatch(selectPost(post));

      // Increment view count (non-blocking)
      postsService.incrementViewCount(postId).catch(() => {
        // Silently ignore view count errors
      });

      return { success: true, data: post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Select a post from current posts array
   */
  const selectPostFromList = (postId: string) => {
    const post = postsState.posts.find((p) => p.id === postId);
    if (post) {
      dispatch(selectPost(post));

      // Increment view count (non-blocking)
      postsService.incrementViewCount(postId).catch(() => {
        // Silently ignore view count errors
      });
    }
  };

  /**
   * Clear selected post
   */
  const clearSelectedPostAction = () => {
    dispatch(clearSelectedPost());
  };

  // === ENGAGEMENT (Future Features) ===

  /**
   * Update post engagement metrics (likes, views, etc.)
   */
  const updateEngagement = (
    postId: string,
    engagement: {
      upvotes?: number;
      downvotes?: number;
      viewCount?: number;
    }
  ) => {
    dispatch(updatePostEngagement({ postId, ...engagement }));
  };

  // === UTILITY ===

  /**
   * Clear error state
   */
  const clearPostsError = () => {
    dispatch(clearError());
  };

  /**
   * Check if user owns a specific post
   */
  const isOwnPost = (authorId: string): boolean => {
    const currentUserId = useAppSelector((state) => state.auth.user?.id);
    return currentUserId === authorId;
  };

  // === RETURN HOOK INTERFACE ===

  return {
    // State
    posts: postsState.posts,
    myPosts: postsState.myPosts,
    selectedPost: postsState.selectedPost,
    pagination: postsState.pagination,
    filters: postsState.filters,

    // Loading states
    isLoading: postsState.isLoading,
    isCreating: postsState.isCreating,
    isUpdating: postsState.isUpdating,
    isDeleting: postsState.isDeleting,
    refreshing: postsState.refreshing,

    // Error state
    error: postsState.error,

    // Actions - Fetch
    fetchPosts,
    loadMorePosts,
    refreshPosts,
    fetchMyPosts,

    // Actions - CRUD
    createPost,
    updatePost,
    deletePost,

    // Actions - Filters (direct dispatch)
    setCategoryFilter: (category?: Category) =>
      dispatch(setCategoryFilter(category)),
    setSearchFilter: (search: string) => dispatch(setSearchFilter(search)),
    setSortBy: (sortBy: PostSortOption) => dispatch(setSortBy(sortBy)),
    clearFilters: () => dispatch(clearFilters()),
    setCategoryFilterAndRefresh,
    setSearchFilterAndRefresh,
    setSortByAndRefresh,
    clearFiltersAndRefresh,

    // Actions - Post Detail
    fetchPostById,
    selectPostFromList,
    clearSelectedPost: clearSelectedPostAction,

    // Actions - Engagement
    updateEngagement,

    // Utilities
    clearPostsError,
    isOwnPost,

    // Computed values
    hasMorePosts: postsState.pagination.hasNextPage,
    totalPosts: postsState.pagination.totalPosts,
    currentPage: postsState.pagination.currentPage,
  };
};
