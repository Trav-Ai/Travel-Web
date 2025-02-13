'use client'
import React, { useState } from 'react';
import styles from './navbar.module.css'; // Importing the CSS module for styling
import Link from 'next/link';
import { logout } from '@/hooks/auth';
import { AuthProvider, useAuth } from '@/hooks/AuthContext';
import { useEffect } from 'react';


const Navbar = ({ }) => {

  const { user, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false); // For mobile menu toggle
  const [isLoggedIn, setIsLoggedIn] = useState(false); // For tracking login status
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobile(!isMobile);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };


  const handleLogout = async () => {
    try {
      await logout();  // Call the logout function (which should handle signing out)
      setIsLoggedIn(false);  // Update the login state
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);


  return (
    <AuthProvider>
      <nav className={styles.navbar}>
      <Link href="/">
        <h1 className={styles.navTitle}>Ai Travel App</h1>
      </Link>
        <div className={styles.navLinks}>
          <Link href="/">
            <button className={styles.navCom}>Home</button>
          </Link>
          <Link href="/explore">
            <button className={styles.navCom}>Explore</button>
          </Link>
          <Link href="/itinerary">
            <button className={styles.navCom}>Itinerary</button>
          </Link>
          <Link href="/social">
            <button className={styles.navCom}>Social</button>
          </Link>
        </div>

        {loading && <p>Loading...</p>}
        {!loading &&
          <div className={styles.ctoButtons}>
            {!isLoggedIn && (
              <>
                <Link href='/signup'>
                  <button className={styles.navButtonSignup}>Sign Up</button>
                </Link>
                <Link href='/signup'>
                  <button className={styles.navButton}>Login</button>
                </Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <button className={styles.userName} onClick={toggleDropdown}>{user.username}</button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <button onClick={handleLogout} className={styles.logout}>
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        }

        <div className={styles.hamburger}>
          <div className={styles.line}></div>
          <div className={styles.line}></div>
          <div className={styles.line}></div>
        </div>
      </nav>
    </AuthProvider>
  );
};

export default Navbar;
