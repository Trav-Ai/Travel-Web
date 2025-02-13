'use client';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import styles from './allLocation.module.css'; // Import CSS module
import Button from './buttons/button.js'; // Import Button component
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AddButton from './buttons/addButton';
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { AuthProvider, useAuth } from '@/hooks/AuthContext';
import Image from 'next/image';

const AllLocation = ({ limit, currentLocation, filter, searchQuery, userID}) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    addedLocations: [],
    likedLocations: [],
    visitedLocations: [],
  });


  useEffect(() => {
    if (userID) {
      console.log(`UserID updated: ${userID}`);
    } else {
      console.log('User is logged out');
    }
  }, [userID]);


  useEffect(() => {
    if (userID) {
      setIsLoading(true); // Set loading to true while fetching user data
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", userID); // Reference to the user's document in Firestore
          const userDocSnap = await getDoc(userDocRef); // Get the document snapshot

          if (userDocSnap.exists()) {
            // If user document exists, set the data
            const user = userDocSnap.data();
            setUserData({
              addedLocations: user.addedLocations || [],
              likedLocations: user.likedLocations || [],
              visitedLocations: user.visitedLocations || [],
              recommended: user.recommended || [], // Ensure recommended is always an array
            });
          } else {
            // Handle case when user is not found
            setError("User not found.");
          }
        } catch (err) {
          // Handle any errors during the fetch
          setError(`User data error: ${err.message}`);
        } finally {
          setIsLoading(false); // Set loading to false after fetch attempt
        }
      };

      fetchUserData();
    }
  }, [userID]);

  // Fetch CSV Data for all locations
  useEffect(() => {
    fetch('/locationData/dataset.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          complete: (result) => {
            let filteredLocations = result.data;

            // Filter based on current location if necessary
            if (currentLocation != null && filter === 'nearby') {
              filteredLocations = filteredLocations.filter(
                (location) => location.Location === currentLocation
              );
            }

            if (filter === 'top') {
              filteredLocations = filteredLocations
                .filter(location => location.Rating && !isNaN(parseFloat(location.Rating))) // Filter out locations without a valid rating
                .map(location => ({
                  ...location,
                  Rating: parseFloat(location.Rating), // Ensure Ratings is a number
                }))
                .sort((a, b) => b.Rating - a.Rating); // Sort by Ratings in descending order
            }

            if (filter === 'beaches') {
              filteredLocations = filteredLocations.filter(
                location => location.Category && location.Category.toLowerCase() === 'beach'.toLowerCase());
            }

            if (filter === 'mountains') {
              filteredLocations = filteredLocations.filter(
                location => location.Category && location.Category.toLowerCase() === 'hill station'.toLowerCase());
            }


            //Search Bar 
            if (searchQuery) {
              const sanitizedSearchQuery = searchQuery.trim().toLowerCase();

              // First, filter locations where the name starts with the query
              let filteredByName = filteredLocations.filter(location =>
                location.Name && location.Name.toLowerCase().startsWith(sanitizedSearchQuery)
              );

              // If we have no results from name matching, search other fields
              if (filteredByName.length === 0) {
                filteredLocations = filteredLocations.filter(location => {
                  const locationLocation = location.Location ? location.Location.toLowerCase() : "";
                  const locationCategory = location.Category ? location.Category.toLowerCase() : "";
                  const locationDescription = location.Description ? location.Description.toLowerCase() : "";

                  // Check other fields for matches
                  return (
                    locationLocation.includes(sanitizedSearchQuery) ||
                    locationCategory.includes(sanitizedSearchQuery) ||
                    locationDescription.includes(sanitizedSearchQuery)
                  );
                });
              } else {
                filteredLocations = filteredByName;
              }
            }



            // If filter is 'recommended' and userID is available, filter based on user's recommended locations
            if (filter === 'recommended' && userID) {
              const recommendedLocations = userData.recommended || [];

              filteredLocations = filteredLocations.filter((location) =>
                recommendedLocations.includes(location.Name) // Match by location name
              );

            }

            setLocations(filteredLocations); // Update locations state with the filtered results
          },
          header: true, // Treats the first row as headers
        });
      })
      .catch((error) => {
        console.error('Error loading CSV data:', error);
        setError('Error loading location data.');
        setIsLoading(false);
      });
  }, [filter, currentLocation, userData.recommended, userID, searchQuery]); // Run this effect when filter, userData.recommended, currentLocation, or userID change


  //Handle Button Actions
  const handleAction = (locationName, action) => {
    fetch('/api/updateUserDataFirebae', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userID: userID, // Use the actual user ID
        location: locationName,
        action: action,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('User data updated:', data);
        // Update user data in state after action
        setUserData((prevData) => {
          const updatedData = { ...prevData };

          if (action === 'add') {
            updatedData.addedLocations.push(locationName);
          } else if (action === 'remove') {
            updatedData.addedLocations = updatedData.addedLocations.filter(
              (loc) => loc !== locationName
            );
          } else if (action === 'like') {
            updatedData.likedLocations.push(locationName);
          } else if (action === 'removeLike') {
            updatedData.likedLocations = updatedData.likedLocations.filter(
              (loc) => loc !== locationName
            );
          } else if (action === 'visit') {
            updatedData.visitedLocations.push(locationName);
          } else if (action === 'removeVisit') {
            updatedData.visitedLocations = updatedData.visitedLocations.filter(
              (loc) => loc !== locationName
            );
          }
          return updatedData;
        });
      })
      .catch((error) => {
        console.error('Error updating user data:', error);
      });
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <AuthProvider>
      <div className={styles.locationGrid}>
        {/*No Locaiton to recommend*/}
        {filter === 'recommended' && userID && locations.length === 0 &&
          <div>
            No Locations to recommend
          </div>
        }
        {/*When no locations are loaded*/}
        {locations.length === 0 && filter !== 'recommended' ? (
          <p>Loading...</p>
        ) : (

          <div className={styles.gridContainer}>
            {locations.slice(0, limit || locations.length).map((location, index) => (
              <div key={index} className={styles.locationCard}>
                <Link href={`/locations/${encodeURIComponent(location.Name)}`} passHref>
                  <img src={location.url} alt={location.Name} />
                </Link>
                <div className={styles.Content}>
                  <div className={styles.info}>
                    <h3>{location.Name}</h3>
                    {/* <p>{location.Category}</p> */}
                    <p>{location.Location}</p>
                  </div>

                  <div className={styles.buttons}>
                    {userID && ( // Check if userID exists
                      <>
                        <Button
                          label="Add"
                          onClick={() =>
                            userData.addedLocations.includes(location.Name)
                              ? handleAction(location.Name, 'remove')
                              : handleAction(location.Name, 'add')
                          }
                          disabled={false}
                          isAdded={userData.addedLocations.includes(location.Name)}
                        />
                        <Button
                          label="Like"
                          onClick={() =>
                            userData.likedLocations.includes(location.Name)
                              ? handleAction(location.Name, 'removeLike')
                              : handleAction(location.Name, 'like')
                          }
                          disabled={false}
                          isLiked={userData.likedLocations.includes(location.Name)}
                        />
                        {/* <Button
                        label="Already Visited"
                        onClick={() =>
                          userData.visitedLocations.includes(location.Name)
                            ? handleAction(location.Name, 'removeVisit')
                            : handleAction(location.Name, 'visit')
                        }
                        disabled={false}
                        isVisited={userData.visitedLocations.includes(location.Name)}
                      /> */}
                      </>
                    )}
                    {/* Always show the "More Details" button */}
                    {/* <Link href={`/locations/${encodeURIComponent(location.Name)}`} passHref>
                  <Button label="More Details" onClick={() => {}} />
                </Link> */}
                  </div>
                </div>
              </div>

            ))}
          </div>

        )
        }
      </div >
    </AuthProvider>
  );
};

export default AllLocation;
