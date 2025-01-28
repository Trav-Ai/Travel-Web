"use client"
import { useState } from 'react';
import Image from 'next/image';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, app, googleProvider } from '@/lib/firebaseConfig';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';

const db = getFirestore(app);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          email,
          displayName: displayName || email.split('@')[0],
          photoURL: photoURL || null,
          createdAt,
          bio: "",
          followers: [],
          following: [],
          posts: 0,
          username: email.split('@')[0]
        });
      } catch (error) {
        console.error("Error creating user document:", error);
      }
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        // Login
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const idToken = await user.getIdToken();
          Cookies.set('authToken', idToken, { expires: 7 });
          console.log('Logged in and token set in cookie:', idToken);
          // window.location.href = '/dashboard';
        } catch (error) {
          console.error('Login error:', error.message);
        }

      } else {
        // Sign up
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const idToken = await user.getIdToken();
          Cookies.set('authToken', idToken, { expires: 7 });
          console.log('Logged in and token set in cookie:', idToken);
          // window.location.href = '/dashboard';
        } catch (error) {
          console.error('Login error:', error.message);
        }
      }

      // Create/update user document
      await createUserDocument(userCredential.user);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      Cookies.set('authToken', idToken, { expires: 7 });
      console.log('Logged in and token set in cookie:', idToken);
      // window.location.href = '/dashboard';
      await createUserDocument(user);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08080e] to-[#6de1e6] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Left Section */}
        <div className="relative hidden md:flex md:w-2/3 bg-gray-100">
          <div className="absolute w-full h-full">
            <Image
              src="/bgImage.jpeg"
              alt="Welcome Image"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
          <div className="relative z-10 text-white p-8 mt-28">
            <h3 className="text-base font-normal opacity-85 mb-2">
              AI Integrated Travel Recommendations
            </h3>
            <h1 className="text-5xl font-bold mb-4">Adventure</h1>
            <p className="text-base font-light opacity-85 leading-relaxed">
              Let AI be your compass as you conquer<br />
              challenges, explore new horizons, and earn<br />
              exciting rewards!
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/3 p-8 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              {isLogin ? 'Login' : 'Sign Up'}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#060511] focus:border-[#060511] transition"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#060511] focus:border-[#060511] transition"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#060511] text-white py-2 px-4 rounded-md hover:bg-[#4e4d5d] transition-colors duration-300 font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors duration-300 font-medium disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <p className="text-center text-sm mt-4">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#06050c] font-semibold hover:text-[#4e4d5d] transition-colors duration-300"
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;