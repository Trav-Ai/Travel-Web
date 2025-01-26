"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import PostGridItem from "@/app/components/PostGridItem";

// Utility Components
const StatItem = ({ label, value }) => (
  <div className="text-center">
    <p className="font-bold text-lg">{value}</p>
    <p className="text-gray-600 text-sm">{label}</p>
  </div>
);

const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-8">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-8 mb-4">
            <Skeleton className="h-16 w-24" />
            <Skeleton className="h-16 w-24" />
            <Skeleton className="h-16 w-24" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  </div>
);

const UserProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { profile: viewedProfile, loading: profileLoading } = useProfile(params.id);
  const { posts, loading: postsLoading } = usePosts(params.id);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user?.uid && viewedProfile) {
        const currentUserDoc = await getDoc(doc(db, "users", user.uid));
        if (currentUserDoc.exists()) {
          setIsFollowing(currentUserDoc.data().following?.includes(params.id) || false);
        }
      }
    };
    checkFollowStatus();
  }, [user?.uid, params.id, viewedProfile]);

  const handleFollowToggle = async () => {
    if (!user?.uid || !params.id) return;

    try {
      const currentUserRef = doc(db, "users", user.uid);
      const profileUserRef = doc(db, "users", params.id);

      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(params.id)
        });
        await updateDoc(profileUserRef, {
          followers: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(params.id)
        });
        await updateDoc(profileUserRef, {
          followers: arrayUnion(user.uid)
        });
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (profileLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-8">
          <h2 className="text-2xl font-bold">User not found</h2>
          <p className="text-gray-600 mt-2">The profile you're looking for doesn't exist.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/social')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.push('/social')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-8">
            <Avatar className="w-32 h-32">
              <AvatarImage src={viewedProfile.photoURL} />
              <AvatarFallback>
                {viewedProfile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">{viewedProfile.username}</h1>
                {user?.uid !== params.id && (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>

              <div className="flex gap-8 mb-4">
                <StatItem label="Posts" value={posts?.length || 0} />
                <StatItem 
                  label="Followers" 
                  value={viewedProfile.followers?.length || 0} 
                />
                <StatItem 
                  label="Following" 
                  value={viewedProfile.following?.length || 0} 
                />
              </div>

              <p className="text-gray-600">{viewedProfile.bio || "No bio yet"}</p>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Posts
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {posts?.map((post) => (
              <PostGridItem 
                key={post.id} 
                post={post}
                onLike={(postId) => {
                  // Handle like functionality
                }}
                onComment={(postId, comment) => {
                  // Handle comment functionality
                }}
              />
            ))}
            {posts?.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No posts yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;