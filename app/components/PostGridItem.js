import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import React, { memo, useState } from 'react'





// Enhanced Post component with optimizations
const  PostGridItem  = memo(({ post, onLike, onComment }) => {
    const [isCommenting, setIsCommenting] = useState(false);
    const [comment, setComment] = useState("");
    const { user } = useAuth();
  
    const handleSubmitComment = async (e) => {
      e.preventDefault();
      if (!comment.trim()) return;
  
      try {
        await onComment(post.id, comment);
        setComment("");
        toast({
          title: "Comment added successfully",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Error adding comment",
          description: error.message,
          variant: "destructive",
        });
      }
    };
  
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md">
        {/* Post Header */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.userPhotoURL} />
              <AvatarFallback>{post.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.username}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt?.toDate()), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" /> Save
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  
        {/* Post Content */}
        {post.imageUrl && (
          <div className="relative aspect-square">
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
            />
          </div>
        )}
  
        <div className="p-4">
          {/* Actions */}
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={post.likes?.includes(user?.uid) ? "text-red-500" : ""}
            >
              <Heart
                className={`h-5 w-5 ${
                  post.likes?.includes(user?.uid) ? "fill-current" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommenting(!isCommenting)}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
  
          {/* Likes count */}
          <p className="font-medium text-sm mb-2">
            {post.likes?.length || 0} likes
          </p>
  
          {/* Caption */}
          {post.caption && (
            <p className="text-sm mb-2">
              <span className="font-medium mr-2">{post.username}</span>
              {post.caption}
            </p>
          )}
  
          {/* Comments */}
          {isCommenting && (
            <div className="mt-4">
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!comment.trim()}>
                  Post
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  });



export default PostGridItem