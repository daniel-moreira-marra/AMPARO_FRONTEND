import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, MessageSquare } from "lucide-react";

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

    // 1. ESTADO DE CARREGAMENTO (Skeletons)
    if (status === "pending") {
        return (
            <div className="space-y-6">
                <CreatePostWidget />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    // 2. ESTADO DE ERRO
    if (status === "error") {
        return (
            <div className="bg-white rounded-2xl border border-border p-10 text-center">
                <p className="text-sm font-medium text-text/50">Ocorreu um erro ao carregar o feed.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-primary font-bold text-xs hover:underline">
                    Recarregar página
                </button>
            </div>
        );
    }

    // 3. RENDERIZAÇÃO DO CONTEÚDO
    return (
        <div className="space-y-6">
            {/* O Widget de criação sempre no topo */}
            <CreatePostWidget />

            {/* Listagem de Posts */}
            <div className="flex flex-col gap-6">
                {data?.pages.map((page) => (
                    page.results.map((post) => (
                        <FeedItem key={post.id} post={post} />
                    ))
                ))}
            </div>

            {/* Infinite Scroll Loader / Mensagens de fim */}
            <div ref={ref} className="py-8 flex flex-col items-center justify-center">
                {isFetchingNextPage ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                    <>
                        {!hasNextPage && data && data.pages[0].results.length > 0 && (
                            <div className="flex flex-col items-center gap-2 opacity-30">
                                <div className="w-1 h-1 bg-text rounded-full" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Fim das atualizações</p>
                            </div>
                        )}
                        {!hasNextPage && data && data.pages[0].results.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-10 opacity-40">
                                <MessageSquare size={32} />
                                <p className="text-sm font-medium">Nenhuma postagem por aqui ainda.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};