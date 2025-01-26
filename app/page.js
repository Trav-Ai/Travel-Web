'use client'
import Image from "next/image";
import AllLocation from "./components/Locations/allLocations";
import RecommendedLocations from "./components/Locations/recLocs.js";
import ExecuteModelButton from "./components/modelButton/modelButton";
import LocationComponent from "./components/CurrentLocation/LocationComponent";
import styles from "./home.module.css";
import ChatBot from "./components/temp";
import Navbar from "./components/NavBar/navbar";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/AuthContext";

export default function Home() {
  const [userID, setUserID] = useState('');
  const [refreshRecLocs, setRefreshRecLocs] = useState(false); // State to trigger re-render of RecommendedLocations

  const handleLogin = (userID) => {
    setUserID(userID);
    console.log("User ID:", userID);
  };


  
  // Callback function passed to ExecuteModelButton to trigger re-render of RecommendedLocations
  const handleModelSuccess = () => {
    setRefreshRecLocs(prevState => !prevState); // Toggle to force re-render
  };

  return (
    <AuthProvider>
    <div>
      <Navbar/>
      <div className={styles.Home}>


        {/* Hero Section */}
        <div className={styles.hero}>
          <Image
            src="/landingpage.jpeg"
            alt="Adventure Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className={styles.backgroundImage}
          />
          <div className={styles.overlay}>
            <div className={styles.textcon}>
              <h2 className={styles.subTitle}>AI Integrated Travel Recommendations</h2>
              <h1 className={styles.mainTitle}>Adventure</h1>
              <p className={styles.description1}>
                Let AI be your compass as you conquer
              </p>
              <p className={styles.description2}>
                challenges, explore new horizons and earn
              </p>
              <p className={styles.description3}> exciting rewards!</p>
            </div>
            <div className={styles.searchBar}>
              <input type="text" placeholder="Search for locations..." className={styles.searchInput} />
              <button className={styles.searchButton}>Search</button>
            </div>
          </div>
        </div>

        {/* Recommended Locations Section */}
        <div className={styles.RecommendedLocations}>
          <h1 className={styles.title}>Recommended Locations</h1>
          <ExecuteModelButton userId={userID} onSuccess={handleModelSuccess} />
          <RecommendedLocations key={refreshRecLocs} userID={userID} />
        </div>

        {/* All Locations Section */}
        <div className={styles.AllLocation}>
          <h1 className={styles.title}>All Locations</h1>
          <AllLocation userID={userID} />
        </div>

        <ChatBot />
      </div>
    </div>
    </AuthProvider>
  );
}
