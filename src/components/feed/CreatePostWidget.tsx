import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, SendIcon, Tag, X } from "lucide-react";

import { useCreatePost } from "@/hooks/useFeed";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const createPostSchema = z.object({
  content: z.string().min(1, "O post não pode estar vazio"),
});

export const CreatePostWidget = () => {
  const { mutate: createPost, isPending } = useCreatePost();
  const user = useAuthStore((state) => state.user);
  const firstName = user?.full_name?.split(" ")[0] || "Usuário";

  const { register, handleSubmit, reset, watch } = useForm<{ content: string }>({
    resolver: zodResolver(createPostSchema),
  });

  const contentValue = watch("content");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const onSubmit = (data: { content: string }) => {
    createPost({ content: data.content, image: selectedImage }, {
      onSuccess: () => {
        reset();
        setSelectedImage(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-[24px] border border-border/50 shadow-sm p-4">
      <div className="flex gap-3">
        {/* Avatar menor para economizar espaço */}
        <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-primary-light text-primary font-bold text-xs">
            {firstName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
          {/* Campo de Texto Compacto */}
          <div className="bg-[#F9FAFB] rounded-2xl border border-gray-100/50 px-4 transition-all focus-within:bg-white focus-within:border-primary/20">
            <textarea
              className="w-full min-h-[44px] bg-transparent border-none focus:ring-0 text-[14px] text-text/80 placeholder:text-text/40 resize-none py-3 font-medium"
              placeholder={`O que você quer falar hoje, ${firstName}?`}
              rows={1}
              {...register("content")}
            />
            
            {selectedImage && (
              <div className="relative pb-3 w-fit group">
                <img 
                  src={URL.createObjectURL(selectedImage)} 
                  alt="Preview" 
                  className="max-h-24 rounded-lg object-cover border border-border/20" 
                />
                <button 
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>

          {/* Rodapé: Ações Discretas */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              {/* Foto: Cinza por padrão, Verde no Hover */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-text/40 hover:text-blue hover:bg-blue/5 cursor-pointer transition-all group">
                <ImagePlus size={18} strokeWidth={1.5} />
                <span className="text-xs font-bold">Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} 
                />
              </label>

              {/* Tag: Cinza por padrão, Azul no Hover */}
              <button 
                type="button" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-text/40 hover:text-blue hover:bg-blue/5 transition-all group"
              >
                <Tag size={18} strokeWidth={1.5} />
                <span className="text-xs font-bold">Tag</span>
              </button>
            </div>

            {/* Botão Publicar Minimalista */}
            <button
                type="submit"
                disabled={isPending || !contentValue?.trim()}
                className={`
                    flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs transition-all
                    ${!contentValue?.trim() || isPending
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue text-white hover:bg-blue/90 active:scale-95 shadow-md shadow-blue/10"}
                `}
                >
                {isPending ? (
                    <Loader2 size={14} className="animate-spin mr-1" />
                ) : (
                    <>
                    {/* Ícone ANTES do texto */}
                    <SendIcon size={15} strokeWidth={2.5} className={!contentValue?.trim() ? "text-gray-400" : "text-white"} />
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