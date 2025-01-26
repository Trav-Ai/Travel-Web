"use client"
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React, { useState } from 'react';
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PostCard = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  
  // Ensure post.comments is always an array
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = likes.includes(user?.uid);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await onComment(post.id, newComment);
    setNewComment("");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader  className="flex flex-row items-center gap-4 ">
        <a href={`/profile/${post.userId}`} className="flex flex-row items-center gap-4 ">
        <Avatar>
          <AvatarImage src={post.userPhotoURL} alt={post.username || 'User'} />
          <AvatarFallback>{post.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{post.username || 'Anonymous'}</p>
          
        </div>
        </a>
      </CardHeader>

      {post.imageUrl && (
        <div className="relative aspect-square">
          <img
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="ml-2">{likes.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="ml-2">{comments.length}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto">
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>

        {post.caption && (
          <p className="mb-4">
            <span className="font-medium mr-2">{post.username || 'Anonymous'}</span>
            {post.caption}
          </p>
        )}

        {showComments && (
          <div className="space-y-4">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {comments.map((comment, index) => (
                <div key={`${comment.userId}-${index}`} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.userPhotoURL} alt={comment.username || 'User'} />
                    <AvatarFallback>{comment.username?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium mr-2">
                        {comment.username || 'Anonymous'}
                      </span>
                      {comment.text}
                    </p>
                    {comment.createdAt && (
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(
                          typeof comment.createdAt === 'object' 
                            ? comment.createdAt.toDate() 
                            : new Date(comment.createdAt),
                          { addSuffix: true }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;