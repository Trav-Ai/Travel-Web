import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebaseConfig';
import { 
  collection, addDoc, query, where, orderBy, 
  getDocs, updateDoc, deleteDoc, doc, increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { set } from 'date-fns';

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
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const feedpostsQuery = query(
        collection(db, 'posts'),
        where('userId', '!=', userId),
        orderBy('createdAt', 'desc')
      );
      const feedsnapshot = await getDocs(feedpostsQuery);
      const feedpostsData = feedsnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setFeedPosts(feedpostsData);
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
      const post = posts.find(p => p.id === postId);
      const likes = post.likes.includes(userId)
        ? post.likes.filter(id => id !== userId)
        : [...post.likes, userId];
      
      await updateDoc(postRef, { likes });
      await fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  const addComment = async (postId, text) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const comment = {
        userId,
        text,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(postRef, {
        comments: increment(1)
      });
      
      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  return { posts,feedPosts, loading, createPost, likePost, addComment };
};