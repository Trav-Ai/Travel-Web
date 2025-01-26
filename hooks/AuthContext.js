import React, { createContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig';  // Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';  // Firebase method for auth state changes
import { doc, getDoc } from 'firebase/firestore';  // Firestore methods
import { db } from '@/lib/firebaseConfig';  // Firestore instance

// Create the context
const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // User data state
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user data from Firestore (including username)
          const userRef = doc(db, 'users', currentUser.uid);  // Reference to the user document
          const userDocSnap = await getDoc(userRef);  // Fetch user document

          if (userDocSnap.exists()) {
            // Add username to the user data
            setUser({
              ...currentUser,  // Include default user data (uid, email, etc.)
              username: userDocSnap.data().username,  // Get the username from Firestore
            });
          } else {
            // Handle case if the user document doesn't exist in Firestore
            setUser(currentUser);  // Just set the user data (without username)
          }
        } catch (err) {
          setError(`Error fetching user data: ${err.message}`);
        }
      } else {
        setUser(null);  // If no user is logged in, reset the user state
      }
      setLoading(false);  // Set loading to false after auth state is determined
    }, (err) => {
      setError(err.message);  // Handle any auth state change errors
      setLoading(false);
    });

    return () => unsubscribe();  // Clean up the listener when the component unmounts
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}  {/* Render children wrapped with AuthContext provider */}
    </AuthContext.Provider>
  );
};

// Custom hook to access user data
export const useAuth = () => {
  return React.useContext(AuthContext);
};
