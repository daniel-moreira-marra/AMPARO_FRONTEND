import { useState, useRef } from "react";
import { Send, Trash2, Loader2, MessageSquareDashed } from "lucide-react";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useComments";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/utils/formatDate";

interface CommentSectionProps {
  postId: number;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useComments(postId, true);
  const { mutate: createComment, isPending: isCreating } = useCreateComment(postId);
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isCreating) return;
    createComment(trimmed, { onSuccess: () => setText("") });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="border-t border-border/30 bg-gray-50/60 px-5 py-4 space-y-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary-light text-primary font-bold text-xs">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex items-center gap-2 bg-gray-100/80 rounded-full px-4 py-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva um comentário..."
            maxLength={500}
            className="flex-1 bg-transparent border-none outline-none focus:outline-none ring-0 focus:ring-0 text-[13px] text-text/80 placeholder:text-text/40 font-medium"
          />
          <button
            type="submit"
            disabled={!text.trim() || isCreating}
            aria-label="Enviar comentário"
            className="text-primary disabled:text-gray-300 hover:text-primary/70 transition-colors flex-shrink-0"
          >
            {isCreating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2} />
            )}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-primary/30" />
        </div>
      )}

      {!isLoading && (!data?.results || data.results.length === 0) && (
        <div className="flex flex-col items-center gap-2 py-6 text-text/30">
          <MessageSquareDashed size={22} />
          <p className="text-xs font-semibold">Nenhum comentário ainda. Seja o primeiro!</p>
        </div>
      )}

      {!isLoading && data?.results && data.results.length > 0 && (
        <div className="space-y-3">
          {data.results.map((comment) => {
            const isOwn = comment.user_id === user?.id;
            return (
              <div key={comment.id} className="flex items-start gap-2.5 group">
                <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                  <AvatarFallback className={`font-bold text-[10px] ${isOwn ? "bg-primary-light text-primary" : "bg-gray-100 text-text/50"}`}>
                    {isOwn ? (user?.full_name?.charAt(0)?.toUpperCase() ?? "U") : "M"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2.5 border border-border/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    {isOwn && (
                      <span className="text-[11px] font-bold text-primary mb-0.5 block">
                        {user?.full_name?.split(" ")[0]}
                      </span>
                    )}
                    <p className="text-[13px] text-text/80 leading-relaxed font-medium">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-1 px-1">
                    <span className="text-[11px] text-text/40 font-medium">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                    {isOwn && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        disabled={isDeleting}
                        aria-label="Deletar comentário"
                        className="flex items-center gap-1 text-[11px] text-red-400/70 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-medium disabled:opacity-30"
                      >
                        <Trash2 size={11} />
                        Deletar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
