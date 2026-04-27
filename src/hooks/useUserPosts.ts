import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, ApiResponse } from "@/types";
import { type ApiFeedPost, normalizePost } from "@/hooks/useFeed";

export function useUserPosts(userId: number | null) {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ApiFeedPost[]>>(`/accounts/users/${userId}/posts/`);
      return data.data.map(normalizePost);
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}
