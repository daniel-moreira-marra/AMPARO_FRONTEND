import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreatePost } from "@/hooks/useFeed";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const createPostSchema = z.object({
    content: z.string().min(1, "O post não pode estar vazio"),
});

export const CreatePostWidget = () => {
    const { mutate: createPost, isPending } = useCreatePost();
    const user = useAuthStore((state) => state.user);
    const displayName = user?.full_name?.trim() || "Usuário";
    const firstName = displayName.split(" ")[0] || "Usuário";
    const avatarInitial = firstName.charAt(0).toUpperCase();
    const { register, handleSubmit, reset } = useForm<{ content: string }>({
        resolver: zodResolver(createPostSchema),
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const onSubmit = (data: { content: string }) => {
        createPost({ content: data.content, image: selectedImage }, {
            onSuccess: () => {
                reset();
                setSelectedImage(null);
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-4">
                <div className="flex gap-4">
                    <Avatar>
                        <AvatarFallback>{avatarInitial}</AvatarFallback>
                    </Avatar>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-4">
                        <div className="relative">
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                placeholder={`O que você está pensando, ${firstName}?`}
                                {...register("content")}
                            />
                        </div>

                        {selectedImage && (
                            <div className="relative rounded-md overflow-hidden bg-muted w-fit max-w-[200px]">
                                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="object-cover max-h-32" />
                                <button
                                    type="button"
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 text-xs hover:bg-black/70"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <ImagePlus className="h-5 w-5" />
                                <span>Adicionar foto</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>

                            <Button type="submit" disabled={isPending} size="sm">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                Publicar
                            </Button>
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
