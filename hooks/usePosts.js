import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebaseConfig';
import { 
  collection, addDoc, query, where, orderBy, 
  getDocs, updateDoc, deleteDoc, doc, arrayUnion, 
  arrayRemove, increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const usePosts = (userId) => {
  const [posts, setPosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch user's own posts
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const userPostsSnapshot = await getDocs(userPostsQuery);
      const userPostsData = userPostsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch posts from other users for feed
      const feedPostsQuery = query(
        collection(db, 'posts'),
        where('userId', '!=', userId),
        orderBy('createdAt', 'desc')
      );
      const feedPostsSnapshot = await getDocs(feedPostsQuery);
      const feedPostsData = feedPostsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(userPostsData);
      setFeedPosts(feedPostsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (image, caption) => {
    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `posts/${Date.now()}-${userId}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Create post document
      const postData = {
        userId,
        imageUrl,
        caption,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };

      const postRef = await addDoc(collection(db, 'posts'), postData);

      // Update user's post count
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        posts: increment(1)
      });

      await fetchPosts();
      return postRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      
      // Determine whether to add or remove like
      await updateDoc(postRef, {
        likes: userId ? (
          arrayUnion(userId)
        ) : (
          arrayRemove(userId)
        )
      });

      await fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  const addComment = async (postId, text) => {
    try {
      if (!userId) {
        throw new Error('User must be logged in to comment');
      }

      const postRef = doc(db, 'posts', postId);
      
      // Create comment object
      const comment = {
        userId,
        text,
        createdAt: new Date().toISOString()
      };

      // Add comment to the post's comments array
      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  return { 
    posts, 
    feedPosts, 
    loading, 
    createPost, 
    likePost, 
    addComment 
  };
};