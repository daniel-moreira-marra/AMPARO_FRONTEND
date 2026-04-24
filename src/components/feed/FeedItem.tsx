import { useState, useRef } from "react";
import type { Post, SharedPost } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Briefcase, Clock, SendHorizonal, Loader2, X, Repeat2 } from "lucide-react";
import { ROLE_LABELS } from "@/constants/roles";
import { useLikePost, useRepost } from "@/hooks/usePostActions";
import { formatRelativeTime } from "@/utils/formatDate";
import { CommentSection } from "./CommentSection";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveApiError } from "@/utils/apiError";

const SharedPostCard = ({ shared }: { shared: SharedPost }) => {
  const roleLabel = shared.author_role ? (ROLE_LABELS[shared.author_role] ?? "Membro") : "Membro";
  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-gray-50/60">
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-[11px] flex-shrink-0">
          {shared.author_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <span className="text-[13px] font-bold text-text leading-none block">{shared.author_name}</span>
          <span className="text-[11px] text-primary/70 font-semibold">{roleLabel}</span>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <p className="text-[13px] text-text/75 font-medium leading-relaxed line-clamp-4">
          {shared.text}
        </p>
        {shared.image && (
          <img
            src={shared.image}
            alt={shared.image_alt_text || "Imagem"}
            className="w-full h-auto object-cover max-h-48 rounded-xl"
          />
        )}
      </div>
    </div>
  );
};

interface FeedItemProps {
  post: Post;
}

export const FeedItem = ({ post }: FeedItemProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareError, setShareError] = useState<string | null>(null);
  const shareTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: repost, isPending: isReposting } = useRepost();
  const user = useAuthStore((state) => state.user);

  const roleLabel = post.author.role ? (ROLE_LABELS[post.author.role] ?? "Membro") : "Membro";

  const handleLike = () => {
    if (isLiking) return;
    likePost({ postId: post.id, liked: post.liked_by_me });
  };

  const openSharePanel = () => {
    setShowSharePanel(true);
    setShareError(null);
    setTimeout(() => shareTextareaRef.current?.focus(), 50);
  };

  const closeSharePanel = () => {
    setShowSharePanel(false);
    setShareText("");
    setShareError(null);
  };

  const handleRepost = () => {
    const text = shareText.trim() || "Compartilhando este post";
    setShareError(null);
    repost(
      { postId: post.id, text },
      {
        onSuccess: () => closeSharePanel(),
        onError: (err) => setShareError(resolveApiError(err, "Não foi possível compartilhar.")),
      }
    );
  };

  return (
    <article className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-5 space-y-4">

        {/* Author header */}
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-full border-2 border-white shadow-sm flex-shrink-0">
            <AvatarImage src={post.author.avatar} alt={post.author.full_name} />
            <AvatarFallback className="bg-primary-light text-primary font-bold text-sm">
              {post.author.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <span className="font-bold text-[15px] text-text leading-tight block">
              {post.author.full_name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 bg-primary-light/50 px-2 py-0.5 rounded-md">
                <Briefcase size={11} className="text-primary" aria-hidden="true" />
                <span className="text-[11px] font-bold text-primary/80 tracking-tight">{roleLabel}</span>
              </div>
              <div className="flex items-center gap-1 text-text/35">
                <Clock size={10} />
                <span className="text-[11px] font-medium">{formatRelativeTime(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Repost indicator */}
        {post.shared_post && (
          <div className="flex items-center gap-1.5 text-text/35 -mb-1">
            <Repeat2 size={13} />
            <span className="text-[11px] font-semibold">Compartilhou uma publicação</span>
          </div>
        )}

        {/* Post content */}
        {post.content && (
          <p className="text-[14px] leading-relaxed text-text/80 font-medium whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Original shared post */}
        {post.shared_post && <SharedPostCard shared={post.shared_post} />}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue/5 text-blue/80 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-blue/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Image (only for original posts, not reposts) */}
        {post.image && !post.shared_post && (
          <div className="rounded-2xl overflow-hidden border border-border/40 -mx-1">
            <img
              src={post.image}
              alt={post.image_alt_text || "Imagem do post"}
              className="w-full h-auto object-cover max-h-[420px]"
            />
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-1 border-t border-gray-50/80">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            aria-label={`${post.liked_by_me ? "Remover curtida" : "Curtir"} — ${post.likes_count} curtidas`}
            aria-pressed={post.liked_by_me}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all group disabled:cursor-not-allowed select-none ${
              post.liked_by_me
                ? "text-red-500 bg-red-50"
                : "text-text/50 hover:text-red-500 hover:bg-red-50/80"
            }`}
          >
            <Heart
              size={17}
              className={`transition-transform group-hover:scale-110 group-active:scale-95 ${
                post.liked_by_me ? "fill-red-500" : ""
              }`}
            />
            <span className="text-xs font-bold">{post.likes_count}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments((v) => !v)}
            aria-label={`Comentários — ${post.comments_count} comentários`}
            aria-expanded={showComments}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all group select-none ${
              showComments
                ? "text-primary bg-primary-light/60"
                : "text-text/50 hover:text-primary hover:bg-primary-light/50"
            }`}
          >
            <MessageCircle size={17} className="transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold">{post.comments_count}</span>
          </button>

          {/* Share / Repost */}
          <button
            onClick={openSharePanel}
            aria-label="Compartilhar post no feed"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all group select-none ${
              showSharePanel
                ? "text-blue bg-blue/8"
                : "text-text/50 hover:text-blue hover:bg-blue/8"
            }`}
          >
            <Share2 size={17} className="transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold">Compartilhar</span>
          </button>
        </div>

        {/* Share / Repost panel */}
        {showSharePanel && (
          <div className="rounded-2xl border border-border/60 bg-gray-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-text/70">Compartilhar no feed</p>
              <button
                onClick={closeSharePanel}
                aria-label="Fechar"
                className="p-1 text-text/40 hover:text-text/70 hover:bg-gray-200/60 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Preview do post original */}
            <div className="bg-white border border-border/40 rounded-xl px-3 py-2.5 text-[12px] text-text/50 font-medium line-clamp-2">
              <span className="font-bold text-text/70">{post.author.full_name}:</span>{" "}
              {post.content}
            </div>

            <div className="flex items-start gap-2.5">
              <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                <AvatarFallback className="bg-primary-light text-primary font-bold text-xs">
                  {user?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <textarea
                ref={shareTextareaRef}
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="Adicione um comentário ao compartilhar..."
                rows={2}
                maxLength={500}
                className="flex-1 bg-white border border-border/50 rounded-xl px-3 py-2 text-[13px] text-text/80 placeholder:text-text/35 font-medium resize-none focus:outline-none"
              />
            </div>

            {shareError && (
              <p className="text-xs text-red-500 font-medium">{shareError}</p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeSharePanel}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-text/50 hover:bg-gray-200/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRepost}
                disabled={isReposting}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-50"
              >
                {isReposting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <SendHorizonal size={13} />
                )}
                Compartilhar no feed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comment section — lazy mounted */}
      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
};
