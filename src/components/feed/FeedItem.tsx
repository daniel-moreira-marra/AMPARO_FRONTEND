import type { Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedItemProps {
    post: Post;
}

export const FeedItem = ({ post }: FeedItemProps) => {
    // Simple date formatter
    const date = new Date(post.created_at);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar>
                    <AvatarImage src={post.author.avatar} alt={post.author.full_name} />
                    <AvatarFallback>{post.author.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{post.author.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                        {date.toLocaleDateString()}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {post.content}
                </p>
                {post.image && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                        <img
                            src={post.image}
                            alt="Post content"
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 border-t bg-muted/20 flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500">
                    <Heart className={`h-4 w-4 ${post.liked_by_me ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likes_count}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                </Button>
            </CardFooter>
        </Card>
    );
};
