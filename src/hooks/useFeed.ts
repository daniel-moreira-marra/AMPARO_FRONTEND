import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, PaginatedResponse } from "@/types";

interface ApiFeedPost {
  id: number;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  text: string;
  image: string | null;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  created_at: string;
  published_at: string | null;
  tags?: string[];
}

const normalizePost = (post: ApiFeedPost): Post => ({
  id: post.id,
  content: post.text,
  image: post.image ?? undefined,
  tags: post.tags,
  author: {
    id: post.author_id,
    full_name: post.author_name,
    avatar: post.author_avatar,
    role: post.author_role,
  },
  created_at: post.published_at ?? post.created_at,
  likes_count: post.likes_count,
  comments_count: post.comments_count,
  liked_by_me: post.liked_by_me,
});

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params: { cursor?: string } = {};
      if (pageParam) params.cursor = pageParam;

      const { data } = await api.get<PaginatedResponse<ApiFeedPost>>("/posts/feed/", { params });
      return {
        ...data,
        results: data.results.map(normalizePost),
      } satisfies PaginatedResponse<Post>;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next, api.defaults.baseURL);
      return url.searchParams.get("cursor") ?? undefined;
    },
    staleTime: 30_000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: { content: string; image?: File | null }) => {
      const formData = new FormData();
      formData.append("text", newPost.content);
      if (newPost.image) {
        formData.append("image", newPost.image);
      }
      const { data } = await api.post("/posts/my-posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};
