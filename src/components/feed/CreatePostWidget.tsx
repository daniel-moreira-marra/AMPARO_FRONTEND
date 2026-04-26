import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, SendHorizonal, Tag, X, Hash, Plus } from "lucide-react";

import { useCreatePost } from "@/hooks/useFeed";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_TAGS = 5;
const MAX_IMAGES = 5;

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

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError]       = useState<string | null>(null);
  const [tags, setTags]                   = useState<string[]>([]);
  const [tagInput, setTagInput]           = useState("");
  const [showTagInput, setShowTagInput]   = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);

  const tagInputRef   = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = selectedImages.map((f) => URL.createObjectURL(f));
    previewUrlsRef.current = urls;
    setImagePreviews(urls);
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  useEffect(() => {
    if (showTagInput) tagInputRef.current?.focus();
  }, [showTagInput]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - selectedImages.length;
    const toProcess = files.slice(0, remaining);
    const valid: File[] = [];

    for (const file of toProcess) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setImageError(`"${file.name}": formato não suportado. Use JPG, PNG, WebP ou GIF.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`"${file.name}": muito grande (máx 5 MB por foto).`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) {
      setImageError(null);
      setSelectedImages((prev) => [...prev, ...valid]);
    }

    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previewUrlsRef.current[idx]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  }, [tagInput, tags]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    if (e.key === "Escape") { setShowTagInput(false); setTagInput(""); }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onSubmit = (data: FormValues) => {
    createPost(
      { content: data.content, images: selectedImages.length > 0 ? selectedImages : undefined, tags },
      {
        onSuccess: () => {
          reset();
          setSelectedImages([]);
          setTags([]);
          setShowTagInput(false);
          setTagInput("");
          setImageError(null);
        },
      }
    );
  };

  const hasContent = !!contentValue?.trim();
  const canAddMore = selectedImages.length < MAX_IMAGES;

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
          <div className={`rounded-2xl border px-4 transition-all ${
            textareaFocused
              ? "bg-white border-primary/20 shadow-sm"
              : "bg-[#F9FAFB] border-gray-100/80"
          }`}>
            <textarea
              className="w-full min-h-[44px] bg-transparent border-none focus:ring-0 text-[14px] text-text/80 placeholder:text-text/35 resize-none py-3 font-medium leading-relaxed"
              placeholder={`O que você quer falar hoje, ${firstName}?`}
              rows={1}
              {...register("content")}
              onFocus={() => setTextareaFocused(true)}
              onBlur={() => setTextareaFocused(false)}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
            />

            {/* Tags */}
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
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-0.5">
                    <Hash size={10} className="text-text/40" />
                    <input
                      ref={tagInputRef}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value.replace(/\s/g, ""))}
                      onKeyDown={handleTagKeyDown}
                      onBlur={addTag}
                      placeholder="tag"
                      maxLength={30}
                      className="bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 text-[12px] font-bold text-text/70 w-16 placeholder:text-text/30"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Image previews grid */}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group/thumb flex-shrink-0">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-[72px] h-[72px] rounded-xl object-cover border border-border/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={`Remover foto ${i + 1}`}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-gray-800/70 text-white rounded-full hover:bg-gray-900 transition-colors shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {canAddMore && (
                  <label className="w-[72px] h-[72px] flex-shrink-0 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 text-text/30 hover:border-primary/40 hover:text-primary/60 cursor-pointer transition-all gap-0.5">
                    <Plus size={15} />
                    <span className="text-[10px] font-bold">
                      {selectedImages.length}/{MAX_IMAGES}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            )}

            {imageError && (
              <p className="text-xs text-red-500 pb-2 font-medium">{imageError}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-0.5">
              {/* Foto button — only visible when no images yet OR always as add-more in toolbar */}
              {selectedImages.length === 0 && (
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text/40 hover:text-blue hover:bg-blue/5 cursor-pointer transition-all">
                  <ImagePlus size={17} strokeWidth={1.8} />
                  <span className="text-[12px] font-bold">Foto</span>
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {/* When images are selected, show a compact "add more" button in toolbar */}
              {selectedImages.length > 0 && canAddMore && (
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-blue bg-blue/5 cursor-pointer transition-all">
                  <ImagePlus size={17} strokeWidth={1.8} />
                  <span className="text-[12px] font-bold">{selectedImages.length}/{MAX_IMAGES}</span>
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {selectedImages.length >= MAX_IMAGES && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text/30 text-[12px] font-bold">
                  <ImagePlus size={17} strokeWidth={1.8} />
                  {MAX_IMAGES}/{MAX_IMAGES}
                </span>
              )}

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
