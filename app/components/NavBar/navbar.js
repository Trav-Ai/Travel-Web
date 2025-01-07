'use client'
import React, { useState } from 'react';
import styles from './Navbar.module.css'; // Importing the CSS module for styling

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false); // For mobile menu toggle

  // Toggle the mobile menu
  const toggleMenu = () => {
    setIsMobile(!isMobile);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        Ai Travel App
      </div>
      
      {/* Desktop Menu */}
      <div className={`${styles.navLinks} ${isMobile ? styles.active : ''}`}>
        <a href="/" className={styles.navLink}>Home</a>
        <a href="/itinerary" className={styles.navLink}>Itinerary</a>
        <a href="/social" className={styles.navLink}>Social</a>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>

      {/* Auth buttons (Login, Sign Up) */}
      <div className={styles.authButtons}>
        <button className={styles.authButton}>Login</button>
        <button className={styles.authButton}>Sign Up</button>
      </div>
    </nav>
  );
};

export default Navbar;
