import { usePosts } from '@/hooks/usePosts';
import { Loader2 } from 'lucide-react';
import React from 'react'
import PostCard from './PostCard';
import { useAuth } from '@/hooks/useAuth';

// Enhanced Post Feed Component
const PostFeed = () => {
    const { user } = useAuth();
    const { posts,feedPosts, loading, likePost, addComment } = usePosts(user?.uid);
  
    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        {feedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => likePost(post.id)}
            onComment={addComment}
          />
        ))}
      </div>
    );
  };

export default PostFeed