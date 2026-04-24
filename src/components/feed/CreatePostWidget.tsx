import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, SendHorizonal, Tag, X, Hash } from "lucide-react";

import { useCreatePost } from "@/hooks/useFeed";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_TAGS = 5;

const createPostSchema = z.object({
  content: z.string().min(1, "O post não pode estar vazio"),
});

type FormValues = z.infer<typeof createPostSchema>;

export const CreatePostWidget = () => {
  const { mutate: createPost, isPending } = useCreatePost();
  const user = useAuthStore((state) => state.user);
  const firstName = user?.full_name?.split(" ")[0] ?? "Usuário";

  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(createPostSchema),
  });

  const contentValue = watch("content");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      previewUrlRef.current = url;
      setImagePreview(url);
    } else {
      previewUrlRef.current = null;
      setImagePreview(null);
    }
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (showTagInput) {
      tagInputRef.current?.focus();
    }
  }, [showTagInput]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Formato não suportado. Use JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setImageError(null);
    setSelectedImage(file);
    e.target.value = "";
  };

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  }, [tagInput, tags]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Escape") {
      setShowTagInput(false);
      setTagInput("");
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onSubmit = (data: FormValues) => {
    createPost(
      { content: data.content, image: selectedImage, tags },
      {
        onSuccess: () => {
          reset();
          setSelectedImage(null);
          setTags([]);
          setShowTagInput(false);
          setTagInput("");
        },
      }
    );
  };

  const hasContent = !!contentValue?.trim();

  return (
    <div className="bg-white rounded-[24px] border border-border/50 shadow-sm p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-primary-light text-primary font-bold text-xs">
            {firstName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-w-0">
          <div className="bg-[#F9FAFB] rounded-2xl border border-gray-100/80 px-4 transition-all focus-within:bg-white focus-within:border-primary/20 focus-within:shadow-sm">
            <textarea
              className="w-full min-h-[44px] bg-transparent border-none focus:ring-0 text-[14px] text-text/80 placeholder:text-text/35 resize-none py-3 font-medium leading-relaxed"
              placeholder={`O que você quer falar hoje, ${firstName}?`}
              rows={1}
              {...register("content")}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
            />

            {/* Tags chips inside the box */}
            {(tags.length > 0 || showTagInput) && (
              <div className="flex flex-wrap items-center gap-1.5 pb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-blue/10 text-blue/80 px-2 py-0.5 rounded-lg text-[12px] font-bold border border-blue/10"
                  >
                    <Hash size={10} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remover tag ${tag}`}
                      className="ml-0.5 hover:text-red-400 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {showTagInput && tags.length < MAX_TAGS && (
                  <div className="flex items-center gap-1 bg-white border border-border/60 rounded-lg px-2 py-0.5">
                    <Hash size={10} className="text-text/30" />
                    <input
                      ref={tagInputRef}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value.replace(/\s/g, ""))}
                      onKeyDown={handleTagKeyDown}
                      onBlur={addTag}
                      placeholder="tag"
                      maxLength={30}
                      className="bg-transparent border-none outline-none text-[12px] font-bold text-text/70 w-16 placeholder:text-text/30 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Image preview */}
            {imagePreview && (
              <div className="relative pb-3 w-fit group">
                <img
                  src={imagePreview}
                  alt="Preview da imagem selecionada"
                  className="max-h-28 rounded-xl object-cover border border-border/30"
                />
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); setImageError(null); }}
                  aria-label="Remover imagem"
                  className="absolute -top-1.5 -right-1.5 p-1 bg-gray-800/70 text-white rounded-full hover:bg-gray-900 transition-colors shadow-sm"
                >
                  <X size={10} />
                </button>
              </div>
            )}

            {imageError && (
              <p className="text-xs text-red-500 pb-2 font-medium">{imageError}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-0.5">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text/40 hover:text-blue hover:bg-blue/5 cursor-pointer transition-all">
                <ImagePlus size={17} strokeWidth={1.8} />
                <span className="text-[12px] font-bold">Foto</span>
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowTagInput((v) => !v)}
                disabled={tags.length >= MAX_TAGS}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all disabled:opacity-40 ${
                  showTagInput
                    ? "text-blue bg-blue/10"
                    : "text-text/40 hover:text-blue hover:bg-blue/5"
                }`}
              >
                <Tag size={17} strokeWidth={1.8} />
                <span className="text-[12px] font-bold">Tag</span>
                {tags.length > 0 && (
                  <span className="bg-blue/20 text-blue/80 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tags.length}
                  </span>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isPending || !hasContent}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs transition-all ${
                !hasContent || isPending
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20"
              }`}
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <SendHorizonal size={14} strokeWidth={2.5} />
                  <span>Publicar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
