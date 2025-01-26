'use client'
// app/pages/explore/page.js
import AllLocation from "@/app/components/Locations/allLocations";
import styles from "./explore.module.css";
import Navbar from "@/app/components/NavBar/navbar";
import Banner from "./components/banner";
import ExploreBanner from "./components/banner";
import { useState } from "react";
import FetchDataButton from "@/app/components/Locations/buttons/addButton";
import { AuthProvider } from "@/hooks/AuthContext";
import SearchBar from "./components/searchbar";

export default function Explore() {
    const limit = '';
    const [filter, setFiter] = useState();
    const [userID, setUserID] = useState();
    const [currentLocation, setcurrentLocation] = useState('Thiruvananthapuram'); 
    

  return (
    <AuthProvider>
    <div>
      <main>
        <Navbar />
        <ExploreBanner />
        <div className={styles.TopDestinations}>
        <h1 className={styles.Title1}>TOP DESTINATIONS</h1>
          <AllLocation limit='4' filter='top'/>
        </div>
        <SearchBar />
        <div className={styles.AllDestinations}>
          <AllLocation limit={limit} filter={filter} userID={userID} currentLocation={currentLocation}/>
        </div>
      </main>
    </div>
    </AuthProvider>
  );
}
