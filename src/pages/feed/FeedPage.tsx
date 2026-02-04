import { useEffect } from "react";
import { useInView } from "react-intersection-observer"; // Need to install
import { Loader2 } from "lucide-react";

import { useFeed } from "@/hooks/useFeed";
import { FeedItem } from "@/components/feed/FeedItem";
import { CreatePostWidget } from "@/components/feed/CreatePostWidget";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedPage = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useFeed();

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage]);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <CreatePostWidget />

            <div className="space-y-6">
                {status === "pending" ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                            <Skeleton className="h-[125px] w-full rounded-xl" />
                        </div>
                    ))
                ) : status === "error" ? (
                    <div className="text-center py-10 text-muted-foreground">
                        Não foi possível carregar o feed.
                    </div>
                ) : (
                    <>
                        {data?.pages.map((page) => (
                            page.results.map((post) => (
                                <FeedItem key={post.id} post={post} />
                            ))
                        ))}

                        <div ref={ref} className="py-4 flex justify-center">
                            {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                            {!hasNextPage && data && data.pages[0].results.length > 0 && (
                                <p className="text-sm text-muted-foreground">Você chegou ao fim.</p>
                            )}
                            {!hasNextPage && data && data.pages[0].results.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhuma postagem ainda.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
