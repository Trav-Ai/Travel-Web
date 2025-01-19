// hooks/useFriends.js
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export const useFriends = (userId) => {
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const usersQuery = query(
      collection(db, 'users'),
      where('id', '!=', userId)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSuggested(users);
      setLoading(false);
    });

    return () => unsubscribe();
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

  return { suggested, loading, followUser, unfollowUser };
};