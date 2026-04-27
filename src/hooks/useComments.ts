import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Comment, PaginatedResponse } from "@/types";
import { useIncrementCommentCount } from "./usePostActions";

interface ApiComment extends Comment {
  comments_count?: number;
}

export function useComments(postId: number, enabled = false) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      // endpoint returns raw DRF pagination — not wrapped in ApiResponse
      const { data } = await api.get<PaginatedResponse<Comment>>(`/posts/comment/${postId}`);
      return data;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();
  const incrementCount = useIncrementCommentCount(postId);

  return useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post<ApiResponse<ApiComment>>(`/posts/comment/${postId}`, { content });
      return res.data.data;
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData<PaginatedResponse<Comment>>(
        ["comments", postId],
        (old) => {
          if (!old) return { results: [newComment], next: null, previous: null };
          return { ...old, results: [newComment, ...old.results] };
        }
      );
      incrementCount(1);
    },
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();
  const incrementCount = useIncrementCommentCount(postId);

  return useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`/posts/comment/${postId}/${commentId}`);
    },
    onSuccess: (_data, commentId) => {
      queryClient.setQueryData<PaginatedResponse<Comment>>(
        ["comments", postId],
        (old) => {
          if (!old) return old;
          return { ...old, results: old.results.filter((c) => c.id !== commentId) };
        }
      );
      incrementCount(-1);
    },
  });
}
