'use client'
import React, { useState } from 'react';
import styles from './navbar.module.css'; // Importing the CSS module for styling

const Navbar = ({ onLogin }) => { 

  
  const [isMobile, setIsMobile] = useState(false); // For mobile menu toggle
  const [isLoginVisible, setIsLoginVisible] = useState(false); // For controlling the input field visibility
  const [userID, setUserID] = useState(''); // For storing the user input
  const [isLoggedIn, setIsLoggedIn] = useState(false); // For tracking login status

  const toggleMenu = () => {
    setIsMobile(!isMobile);
  };

  const handleLoginClick = () => {
    setIsLoginVisible(true); // Show login form when login button is clicked
  };

  const handleInputChange = (event) => {
    setUserID(event.target.value); // Update userID state with the input
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(userID); // Passing userID to the parent component
    setIsLoggedIn(true); // Mark user as logged in
    setIsLoginVisible(false); // Hide the login form after submission
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Mark user as logged out
    setUserID(''); // Clear userID
    window.location.reload();
  };

  return (
    <nav className={styles.navbar}>
      <h1 className={styles.navTitle}>Ai Travel App</h1>
      <div className={styles.navLinks}>
        <button className={styles.navCom}>Home</button>
        <button className={styles.navCom}>Itinerary</button>
        <button className={styles.navCom}>Social</button>

        {/* Conditionally render Sign Up / Login buttons */}
        {!isLoggedIn && (
          <>
            <button className={styles.navButton}>Sign Up</button>
            <button className={styles.navButton} onClick={handleLoginClick}>Login</button>
          </>
        )}

        {/* Conditionally render Logout button and username */}
        {isLoggedIn && (
          <>
            <span className={styles.userName}>Welcome, {userID}</span> {/* Display the logged-in user's name */}
            <button className={styles.navButton} onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>

      {/* Conditionally render the login input field */}
      {isLoginVisible && !isLoggedIn && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userID}
            onChange={handleInputChange}
            className={styles.loginInput}
          />
          <button type="submit" className={styles.navButton}>Submit</button>
        </form>
      )}
    </nav>
  );
};

export default Navbar;
