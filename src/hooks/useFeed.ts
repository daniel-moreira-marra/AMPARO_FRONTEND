import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, PaginatedResponse, ApiResponse } from "@/types";

export interface ApiFeedSharedPost {
  id: number;
  author_id?: number;
  author_name: string;
  author_role?: string;
  text: string;
  image: string | null;
  image_alt_text?: string;
  images?: string[];
  created_at: string;
}

export interface ApiFeedPost {
  id: number;
  author_id?: number;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  text: string;
  image: string | null;
  image_alt_text?: string;
  images?: string[];
  likes_count: number;
  comments_count: number;
  liked_by_me?: boolean;
  shared_post?: ApiFeedSharedPost | null;
  created_at: string;
  published_at: string | null;
  tags?: string[];
}

const resolveImages = (images?: string[], image?: string | null): string[] => {
  if (images && images.length > 0) return images;
  if (image) return [image];
  return [];
};

export const normalizePost = (post: ApiFeedPost): Post => ({
  id: post.id,
  content: post.text,
  image: post.image ?? undefined,
  images: resolveImages(post.images, post.image),
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
        author_id: post.shared_post.author_id,
        author_name: post.shared_post.author_name,
        author_role: post.shared_post.author_role,
        text: post.shared_post.text,
        image: post.shared_post.image ?? undefined,
        images: resolveImages(post.shared_post.images, post.shared_post.image),
        image_alt_text: post.shared_post.image_alt_text,
        created_at: post.shared_post.created_at,
      }
    : undefined,
});

export interface FeedFilters {
  q?: string;
  role?: string;
  tag?: string;
}

export const useFeed = (filters?: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: ["feed", filters ?? {}],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam;
      if (filters?.q) params.q = filters.q;
      if (filters?.role) params.role = filters.role;
      if (filters?.tag) params.tag = filters.tag;

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
    mutationFn: async (newPost: { content: string; images?: File[]; tags?: string[] }) => {
      const formData = new FormData();
      formData.append("text", newPost.content);
      if (newPost.images && newPost.images.length > 0) {
        newPost.images.forEach((img) => formData.append("images", img));
      }
      if (newPost.tags && newPost.tags.length > 0) {
        newPost.tags.forEach((tag) => formData.append("tags", tag));
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
