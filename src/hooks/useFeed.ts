import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, PaginatedResponse } from "@/types";

interface FeedParams {
    cursor?: string;
}

export const useFeed = () => {
    return useInfiniteQuery({
        queryKey: ["feed"],
        queryFn: async ({ pageParam }: { pageParam?: string }) => {
            const params: FeedParams = {};
            if (pageParam) {
                params.cursor = pageParam;
            }
            const { data } = await api.get<PaginatedResponse<Post>>("/posts/feed/", { params });
            return data;
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            // Parse cursor from next URL if needed, OR backend returns logic cursor
            // Django CursorPagination returns a URL in 'next'. We need to extract the 'cursor' param.
            if (!lastPage.next) return undefined;
            const url = new URL(lastPage.next);
            return url.searchParams.get("cursor") || undefined;
        },
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPost: { content: string; image?: File | null }) => {
            const formData = new FormData();
            formData.append("content", newPost.content);
            if (newPost.image) {
                formData.append("image", newPost.image);
            }
            // If backend requires multipart/form-data, axios handles it if data is FormData
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
