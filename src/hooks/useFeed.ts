import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, PaginatedResponse, ApiResponse } from "@/types";

interface ApiFeedSharedPost {
  id: number;
  author_name: string;
  author_role?: string;
  text: string;
  image: string | null;
  image_alt_text?: string;
  created_at: string;
}

interface ApiFeedPost {
  id: number;
  author_id?: number;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  text: string;
  image: string | null;
  image_alt_text?: string;
  likes_count: number;
  comments_count: number;
  liked_by_me?: boolean;
  shared_post?: ApiFeedSharedPost | null;
  created_at: string;
  published_at: string | null;
  tags?: string[];
}

const normalizePost = (post: ApiFeedPost): Post => ({
  id: post.id,
  content: post.text,
  image: post.image ?? undefined,
  image_alt_text: post.image_alt_text,
  tags: post.tags,
  author: {
    id: post.author_id ?? 0,
    full_name: post.author_name,
    avatar: post.author_avatar,
    role: post.author_role,
  },
  created_at: post.published_at ?? post.created_at,
  likes_count: post.likes_count,
  comments_count: post.comments_count,
  liked_by_me: post.liked_by_me ?? false,
  shared_post: post.shared_post
    ? {
        id: post.shared_post.id,
        author_name: post.shared_post.author_name,
        author_role: post.shared_post.author_role,
        text: post.shared_post.text,
        image: post.shared_post.image ?? undefined,
        image_alt_text: post.shared_post.image_alt_text,
        created_at: post.shared_post.created_at,
      }
    : undefined,
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
      try {
        const url = new URL(lastPage.next);
        return url.searchParams.get("cursor") ?? undefined;
      } catch {
        return undefined;
      }
    },
    staleTime: 30_000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: { content: string; image?: File | null; tags?: string[] }) => {
      const formData = new FormData();
      formData.append("text", newPost.content);
      if (newPost.image) {
        formData.append("image", newPost.image);
      }
      const { data } = await api.post<ApiResponse<ApiFeedPost>>("/posts/my-posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};
