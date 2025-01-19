"use client"
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Loader2, AlertCircle, Activity } from 'lucide-react';

// Custom hook for enhanced friend suggestions
const useEnhancedFriends = (userId) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchSuggestions = async () => {
      try {
        // Get current user's data
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        const currentUser = { id: userDocSnap.id, ...userDocSnap.data() };
        const following = currentUser.following || [];

        // Get all users except current user
        const usersQuery = query(
          collection(db, 'users'),
        );
        
        const snapshot = await getDocs(usersQuery);
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          score: 0 // Initialize score for ranking
        }));

        // Calculate suggestion scores
        const scoredUsers = users
          .filter(user => user.id!=userId && !following.includes(user.id))
          .map(user => {
            let score = 0;

            // Factor 1: Mutual friends (highest weight)
            const mutualFriends = (user.followers || [])
              .filter(id => following.includes(id)).length;
            score += mutualFriends * 10;

            // Factor 2: Activity level (medium weight)
            const recentPosts = (user.posts || [])
              .filter(post => {
                const postDate = post.createdAt?.toDate();
                return postDate && (Date.now() - postDate) < (30 * 24 * 60 * 60 * 1000);
              }).length;
            score += recentPosts * 5;

            // Factor 3: Follower count (lower weight)
            score += (user.followers?.length || 0) * 0.1;

            return { ...user, score, mutualFriends };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 5); // Get top 5 suggestions

        setSuggestions(scoredUsers);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [userId]);

  const followUser = async (targetUserId) => {
    if (!userId) return;
    
    const currentUserRef = doc(db, 'users', userId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    try {
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId)
      });
      await updateDoc(targetUserRef, {
        followers: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async (targetUserId) => {
    if (!userId) return;
    
    const currentUserRef = doc(db, 'users', userId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    try {
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId)
      });
      await updateDoc(targetUserRef, {
        followers: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return { suggestions, loading, followUser, unfollowUser };
};

const FriendSuggestions = () => {
  const { user } = useAuth();
  const { suggestions, loading, followUser, unfollowUser } = useEnhancedFriends(user?.uid);

  if (loading) {
    return (
      <Card>
        <CardHeader>People to Follow </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Finding people you may know...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <h1 className='text-xl font-bold'>People to follow</h1>
        <AlertDescription>
          No suggestions available at the moment
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="min-w-fit">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="font-semibold">Suggested for You</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={suggestion.photoURL} />
                <AvatarFallback>
                  {suggestion.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{suggestion.username}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {suggestion.mutualFriends > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {suggestion.mutualFriends} mutual
                    </span>
                  )}
                  {suggestion.posts?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => followUser(suggestion.id)}
              className="transition-all hover:bg-blue-50 hover:text-blue-600"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Follow
              </span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FriendSuggestions;