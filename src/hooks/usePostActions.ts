import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, PaginatedResponse, ApiResponse } from "@/types";

type FeedCache = InfiniteData<PaginatedResponse<Post>>;
type UserPostsCache = Post[];

const updatePostInAllFeedCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  updater: (post: Post) => Post,
) => {
  queryClient.setQueriesData<FeedCache>({ queryKey: ["feed"] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        results: page.results.map((post) => (post.id === postId ? updater(post) : post)),
      })),
    };
  });
};

const updatePostInUserPostsCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  updater: (post: Post) => Post,
) => {
  queryClient.setQueriesData<UserPostsCache>({ queryKey: ["user-posts"] }, (old) => {
    if (!old) return old;
    return old.map((post) => (post.id === postId ? updater(post) : post));
  });
};

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: number; liked: boolean }) => {
      if (liked) {
        await api.delete(`/posts/unlike/${postId}`);
        return null;
      }
      const { data } = await api.post(`/posts/like/${postId}`);
      return data;
    },
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });

      const previousFeed = queryClient.getQueriesData<FeedCache>({ queryKey: ["feed"] });
      const previousUserPosts = queryClient.getQueriesData<UserPostsCache>({ queryKey: ["user-posts"] });

      const updater = (post: Post): Post => ({
        ...post,
        liked_by_me: !liked,
        likes_count: liked ? post.likes_count - 1 : post.likes_count + 1,
      });

      updatePostInAllFeedCaches(queryClient, postId, updater);
      updatePostInUserPostsCaches(queryClient, postId, updater);

      return { previousFeed, previousUserPosts };
    },
    onError: (_err, _vars, context) => {
      context?.previousFeed?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousUserPosts?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/posts/my-posts/${postId}/`);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });

      const previousFeed = queryClient.getQueriesData<FeedCache>({ queryKey: ["feed"] });
      const previousUserPosts = queryClient.getQueriesData<UserPostsCache>({ queryKey: ["user-posts"] });

      queryClient.setQueriesData<FeedCache>({ queryKey: ["feed"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.filter((post) => post.id !== postId),
          })),
        };
      });

      queryClient.setQueriesData<UserPostsCache>({ queryKey: ["user-posts"] }, (old) => {
        if (!old) return old;
        return old.filter((post) => post.id !== postId);
      });

      return { previousFeed, previousUserPosts };
    },
    onError: (_err, _vars, context) => {
      context?.previousFeed?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousUserPosts?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
}

export function useRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: number; text: string }) => {
      const { data } = await api.post<ApiResponse<{ id: number }>>("/posts/my-posts/", {
        text,
        parent_post: postId,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });
}

export function useIncrementCommentCount(postId: number) {
  const queryClient = useQueryClient();

  return (delta: number) => {
    updatePostInAllFeedCaches(queryClient, postId, (post) => ({
      ...post,
      comments_count: Math.max(0, post.comments_count + delta),
    }));
    updatePostInUserPostsCaches(queryClient, postId, (post) => ({
      ...post,
      comments_count: Math.max(0, post.comments_count + delta),
    }));
  };
}
