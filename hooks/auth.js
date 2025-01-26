import { signOut } from 'firebase/auth';  // Import signOut from Firebase
import { auth } from '@/lib/firebaseConfig';  // Your Firebase authentication instance

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);  // Calls Firebase's signOut method to log the user out
    console.log("User logged out successfully");  // Optional: Log message to confirm successful logout
  } catch (error) {
    console.error("Error logging out: ", error.message);  // Log error message in case of failure
  }
};
