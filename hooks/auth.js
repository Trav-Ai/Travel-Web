import { signOut } from 'firebase/auth';  // Import signOut from Firebase
import { auth } from '@/lib/firebaseConfig';  // Your Firebase authentication instance
import Cookies from 'js-cookie';

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    Cookies.remove('authToken');
    console.log("User logged out successfully"); 

  } catch (error) {
    console.error("Error logging out: ", error.message);  // Log error message in case of failure
  }
};
