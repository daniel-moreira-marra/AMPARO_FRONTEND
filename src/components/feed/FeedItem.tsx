import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Post, SharedPost } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart, MessageCircle, Share2, Briefcase, Clock, SendHorizonal, Loader2, X,
  Repeat2, Trash2, ChevronLeft, ChevronRight, Maximize2,
} from "lucide-react";
import { ROLE_LABELS, getRoleStyle } from "@/constants/roles";
import { useLikePost, useRepost, useDeletePost } from "@/hooks/usePostActions";
import { formatRelativeTime } from "@/utils/formatDate";
import { CommentSection } from "./CommentSection";
import { useAuthStore } from "@/store/useAuthStore";
import { resolveApiError } from "@/utils/apiError";

// ─── ImageLightbox ────────────────────────────────────────────────────────────

const ImageLightbox = ({
  images,
  initialIdx,
  onClose,
}: {
  images: string[];
  initialIdx: number;
  onClose: () => void;
}) => {
  const [idx, setIdx] = useState(initialIdx);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowLeft")  setIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx((i) => Math.min(images.length - 1, i + 1));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [images.length]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Fechar"
      >
        <X size={18} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-[13px] font-semibold px-4 py-1 rounded-full select-none">
          {idx + 1} / {images.length}
        </div>
      )}

      {/* Image */}
      <img
        src={images[idx]}
        alt={`Imagem ${idx + 1} de ${images.length}`}
        className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.max(0, i - 1)); }}
          disabled={idx === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors disabled:opacity-25 disabled:cursor-default"
          aria-label="Imagem anterior"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.min(images.length - 1, i + 1)); }}
          disabled={idx === images.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors disabled:opacity-25 disabled:cursor-default"
          aria-label="Próxima imagem"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              aria-label={`Ir para imagem ${i + 1}`}
              className={`rounded-full transition-all duration-200 ${
                i === idx ? "w-7 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/65"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ImageCarousel ────────────────────────────────────────────────────────────

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [idx, setIdx]             = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!images.length) return null;

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => Math.max(0, i - 1)); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => Math.min(images.length - 1, i + 1)); };

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden border border-border/40 -mx-1 group/carousel select-none bg-gray-50">

        {/* Sliding track */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIdx(i)}
              className="flex-shrink-0 w-full focus:outline-none"
              aria-label={`Ampliar imagem ${i + 1} de ${images.length}`}
            >
              <img
                src={src}
                alt={`Imagem ${i + 1}`}
                className="w-full max-h-[480px] object-contain bg-gray-50"
                draggable={false}
              />
            </button>
          ))}
        </div>

        {/* Prev arrow */}
        {images.length > 1 && idx > 0 && (
          <button
            onClick={prev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Imagem anterior"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Next arrow */}
        {images.length > 1 && idx < images.length - 1 && (
          <button
            onClick={next}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Próxima imagem"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Top-right: counter pill + expand button */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {images.length > 1 && (
            <span className="bg-black/40 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {idx + 1}/{images.length}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
            className="p-1.5 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Ver em tela cheia"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                aria-label={`Ir para imagem ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === idx
                    ? "w-5 h-1.5 bg-white shadow-sm"
                    : "w-1.5 h-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <ImageLightbox
          images={images}
          initialIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
};

// ─── SharedPostCard ───────────────────────────────────────────────────────────

const SharedPostCard = ({ shared }: { shared: SharedPost }) => {
  const navigate = useNavigate();
  const roleLabel  = shared.author_role ? (ROLE_LABELS[shared.author_role] ?? "Membro") : "Membro";
  const sharedStyle = getRoleStyle(shared.author_role);
  const sharedImages = shared.images ?? (shared.image ? [shared.image] : []);

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-gray-50/60">
      <button
        onClick={() => shared.author_id && navigate(`/profile/${shared.author_id}`)}
        disabled={!shared.author_id}
        className="w-full px-4 pt-3 pb-2 flex items-center gap-2 text-left hover:bg-gray-100/60 transition-colors disabled:cursor-default"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0"
          style={{ background: sharedStyle.lightBg, color: sharedStyle.color }}
        >
          {shared.author_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <span className="text-[13px] font-bold text-text leading-none block">{shared.author_name}</span>
          <span className="text-[11px] font-semibold" style={{ color: sharedStyle.color }}>{roleLabel}</span>
        </div>
      </button>
      <div className="px-4 pb-3 space-y-2">
        <p className="text-[13px] text-text/75 font-medium leading-relaxed line-clamp-4">
          {shared.text}
        </p>
        {sharedImages.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-border/40">
            <ImageCarousel images={sharedImages} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── FeedItem ─────────────────────────────────────────────────────────────────

interface FeedItemProps {
  post: Post;
}

export const FeedItem = ({ post }: FeedItemProps) => {
  const [showComments, setShowComments]         = useState(false);
  const [showSharePanel, setShowSharePanel]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareText, setShareText]               = useState("");
  const [shareError, setShareError]             = useState<string | null>(null);
  const shareTextareaRef = useRef<HTMLTextAreaElement>(null);

  const navigate = useNavigate();
  const { mutate: likePost,   isPending: isLiking }   = useLikePost();
  const { mutate: repost,     isPending: isReposting } = useRepost();
  const { mutate: deletePost, isPending: isDeleting }  = useDeletePost();
  const user = useAuthStore((state) => state.user);

  const isOwner   = !!user && user.id === post.author.id;
  const roleLabel = post.author.role ? (ROLE_LABELS[post.author.role] ?? "Membro") : "Membro";
  const roleStyle = getRoleStyle(post.author.role);
  const postImages = post.images ?? (post.image ? [post.image] : []);

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

  const handleDelete = () => {
    deletePost(post.id, { onSuccess: () => setShowDeleteConfirm(false) });
  };

  return (
    <article className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-5 space-y-4">

        {/* Author header */}
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => post.author.id && navigate(`/profile/${post.author.id}`)}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-11 w-11 rounded-full border-2 border-white shadow-sm flex-shrink-0">
              <AvatarImage src={post.author.avatar} alt={post.author.full_name} />
              <AvatarFallback
                className="font-bold text-sm"
                style={{ background: roleStyle.lightBg, color: roleStyle.color }}
              >
                {post.author.full_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <span className="font-bold text-[15px] text-text leading-tight block">
                {post.author.full_name}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md"
                  style={{ background: roleStyle.lightBg }}
                >
                  <Briefcase size={11} aria-hidden="true" style={{ color: roleStyle.color }} />
                  <span className="text-[11px] font-bold tracking-tight" style={{ color: roleStyle.textColor }}>{roleLabel}</span>
                </div>
                <div className="flex items-center gap-1 text-text/35">
                  <Clock size={10} />
                  <span className="text-[11px] font-medium">{formatRelativeTime(post.created_at)}</span>
                </div>
              </div>
            </div>
          </button>

          {isOwner && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Excluir publicação"
              className="flex-shrink-0 p-1.5 rounded-lg text-text/25 hover:text-red-400 hover:bg-red-50 transition-all"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-3.5 flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-text/70">Excluir esta publicação?</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 rounded-lg text-xs font-bold text-text/50 hover:bg-gray-200/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Excluir
              </button>
            </div>
          </div>
        )}

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

        {/* Images carousel (only for original posts) */}
        {postImages.length > 0 && !post.shared_post && (
          <ImageCarousel images={postImages} />
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-1 border-t border-gray-50/80">
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

      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
};
