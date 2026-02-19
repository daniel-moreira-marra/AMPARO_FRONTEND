import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { Post, PaginatedResponse } from "@/types";

interface FeedParams {
    cursor?: string;
}

interface ApiFeedPost {
    id: number;
    author_name: string;
    text: string;
    image: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    published_at: string | null;
}

const normalizePost = (post: ApiFeedPost): Post => ({
    id: post.id,
    content: post.text,
    image: post.image ?? undefined,
    author: {
        id: post.id,
        full_name: post.author_name,
    },
    created_at: post.published_at ?? post.created_at,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
    liked_by_me: false,
});

export const useFeed = () => {
    return useInfiniteQuery({
        queryKey: ["feed"],
        queryFn: async ({ pageParam }: { pageParam?: string }) => {
            const params: FeedParams = {};
            if (pageParam) {
                params.cursor = pageParam;
            }
            const { data } = await api.get<PaginatedResponse<ApiFeedPost>>("/posts/feed/", { params });
            return {
                ...data,
                results: data.results.map(normalizePost),
            } satisfies PaginatedResponse<Post>;
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            // Parse cursor from next URL if needed, OR backend returns logic cursor
            // Django CursorPagination returns a URL in 'next'. We need to extract the 'cursor' param.
            if (!lastPage.next) return undefined;
            const url = new URL(lastPage.next, api.defaults.baseURL);
            return url.searchParams.get("cursor") || undefined;
        },
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
