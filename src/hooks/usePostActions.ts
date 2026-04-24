import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, PaginatedResponse, ApiResponse } from "@/types";

type FeedCache = InfiniteData<PaginatedResponse<Post>>;

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
      const previousFeed = queryClient.getQueryData<FeedCache>(["feed"]);

      queryClient.setQueryData<FeedCache>(["feed"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    liked_by_me: !liked,
                    likes_count: liked ? post.likes_count - 1 : post.likes_count + 1,
                  }
                : post
            ),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeed !== undefined) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
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
    },
  });
}

export function useIncrementCommentCount(postId: number) {
  const queryClient = useQueryClient();

  return (delta: number) => {
    queryClient.setQueryData<FeedCache>(["feed"], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.map((post) =>
            post.id === postId
              ? { ...post, comments_count: Math.max(0, post.comments_count + delta) }
              : post
          ),
        })),
      };
    });
  };
}
