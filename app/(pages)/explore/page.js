'use client'
// app/pages/explore/page.js
import AllLocation from "@/app/components/Locations/allLocations";
import styles from "./explore.module.css";
import Navbar from "@/app/components/NavBar/navbar";
import Banner from "./components/banner";
import ExploreBanner from "./components/banner";
import { useState } from "react";
import FetchDataButton from "@/app/components/Locations/buttons/addButton";
import { AuthProvider, useAuth } from '@/hooks/AuthContext';
import SearchBar from "./components/searchbar";
import Link from "next/link";
import { app } from "@/lib/firebaseConfig";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { auth } from "@/lib/firebaseConfig";
import ModelButton from "@/app/components/modelButton/modelButton";
import { useSearchParams } from 'next/navigation';

export default function Explore() {
  const limit = '';
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setcurrentLocation] = useState('Thiruvananthapuram');

  const category = useSearchParams().get('category');

  useEffect(() => {
    if (category) {
      setSearchQuery(category);
    }
  }, [category]);

  // Function to handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter); // Update the filter value
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);  // Update state when SearchBar sends the value
  };

  const activeStyle = {
    backgroundColor: '#0074D9',
    color: 'white',
    fontWeight: '400'
  };

  // Style for inactive buttons
  const inactiveStyle = {
    border: '1px rgb(143, 143, 143) solid',
    backgroundColor: 'transparent',
    color: 'black'
  };

  useEffect(() => {
    const checkAuthentication = () => {
      const idToken = Cookies.get('authToken');

      if (idToken) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUser(user);
            setUserID(user.uid);
            console.log('User is authenticated:', user.uid);
          } else {
            setUser(null);
            console.log('No user is authenticated.');
          }
        });

        return () => unsubscribe();
      } else {
        setUser(null);
        console.log('No user is authenticated.');
      }
    };

    checkAuthentication();
  }, []);

  //Updating userID when Logging out
  useEffect(() => {
    const idToken = Cookies.get('authToken');

    if (!idToken) {
      setUser(null);
      setUserID(null);
    }
  }, [user, userID]);

  


  return (
    <AuthProvider>
      <div>
        <main>
          <Navbar />
          <ExploreBanner />
          <div className={styles.TopDestinations}>
            <div>
              <h1 className={styles.Title1}>TOP DESTINATIONS</h1>
              <AllLocation limit='4' filter='top' userID={userID} />
            </div>

          </div>
          <SearchBar onSearch={handleSearchChange} query={category} />
          {!searchQuery ? (<div>
            <div className={styles.filters}>
              <button className={filter === 'all' ? styles.filterButtonActive : styles.filterButton} onClick={() => handleFilterChange('all')}>All</button>
              <button className={filter === 'recommended' ? styles.filterButtonActive : styles.filterButton} onClick={() => handleFilterChange('recommended')}>Recommended</button>
              <button className={filter === 'nearby' ? styles.filterButtonActive : styles.filterButton} onClick={() => handleFilterChange('nearby')}>Nearby</button>
              <button className={filter === 'top' ? styles.filterButtonActive : styles.filterButton} onClick={() => handleFilterChange('top')}>Top Rated</button>
              <button className={filter === 'beaches' ? styles.filterButtonActive : styles.filterButton} onClick={() => handleFilterChange('beaches')}>Beaches</button>
              <button className={filter === 'mountains' ? styles.filterButtonActive : styles.filterButton} onClick={() => handleFilterChange('mountains')}>Mounatains</button>
            </div>


            {!user && filter === 'recommended' ? (
              <div className={styles.Error}>
                <h1>Please Log in to access recommended Locations</h1>
                <Link href='/signup'>
                  <button className={styles.loginButton}>Log in</button>
                </Link>
              </div>
            ) : (
              <div className={styles.AllDestinations}>

                {/*Refresh Button*/}
                {user && filter === 'recommended' &&
                  <ModelButton userId={userID} />
                }

                <AllLocation limit={limit} filter={filter} currentLocation={currentLocation} userID={userID} />
              </div>
            )}
          </div>)

            : <div className={styles.AllDestinations}>
              <AllLocation searchQuery={searchQuery} userID={userID} />
            </div>
          }
        </main>
      </div>
    </AuthProvider>
  );
}
