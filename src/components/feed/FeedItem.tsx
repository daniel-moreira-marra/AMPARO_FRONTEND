import type { Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Briefcase } from "lucide-react";
import { ROLE_LABELS } from "@/constants/roles";

interface FeedItemProps {
  post: Post;
}

export const FeedItem = ({ post }: FeedItemProps) => {
  const roleLabel = post.author.role ? (ROLE_LABELS[post.author.role] ?? 'Membro') : 'Membro';

  return (
    <article className="bg-white rounded-3xl border border-border/50 shadow-sm p-5 space-y-4">

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-full border-2 border-white shadow-sm">
            <AvatarImage src={post.author.avatar} alt={post.author.full_name} />
            <AvatarFallback className="bg-primary-light text-primary font-bold">
              {post.author.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-[15px] text-text leading-tight">
              {post.author.full_name}
            </span>
            <div className="flex items-center gap-1.5 text-primary-dark/70 bg-primary-light/40 px-2 py-0.5 rounded-md w-fit mt-1">
              <Briefcase size={12} className="text-primary" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-tight">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[14px] leading-relaxed text-text/80 font-medium">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-50 text-blue-600/80 px-3 py-1 rounded-lg text-[11px] font-bold border border-blue-100/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.image && (
        <div className="relative rounded-2xl overflow-hidden border border-border/40">
          <img
            src={post.image}
            alt="Imagem do post"
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      <div className="flex items-center gap-6 pt-2">
        <button
          aria-label={`Curtir post (${post.likes_count} curtidas)`}
          className="flex items-center gap-1.5 text-text/60 hover:text-red-500 transition-colors group"
        >
          <Heart
            size={20}
            className={`transition-transform group-hover:scale-110 ${
              post.liked_by_me ? 'fill-red-500 text-red-500' : ''
            }`}
          />
          <span className="text-xs font-bold">{post.likes_count}</span>
        </button>

        <button
          aria-label={`Comentar (${post.comments_count} comentários)`}
          className="flex items-center gap-1.5 text-text/60 hover:text-primary transition-colors group"
        >
          <MessageCircle size={20} className="transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold">{post.comments_count}</span>
        </button>

        <button
          aria-label="Compartilhar post"
          className="flex items-center text-text/60 hover:text-text transition-colors group"
        >
          <Share2 size={20} className="transition-transform group-hover:scale-110" />
        </button>
      </div>
    </article>
  );
};
