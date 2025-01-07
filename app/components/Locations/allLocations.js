'use client';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import styles from './allLocation.module.css'; // Import CSS module
import Button from './buttons/button.js'; // Import Button component
import Link from 'next/link';

const AllLocation = () => {
  const [locations, setLocations] = useState([]);
  const [userData, setUserData] = useState({
    addedLocations: [],
    likedLocations: [],
    visitedLocations: [],
  });

  // Fetch user data
  useEffect(() => {
    fetch('/userData/userData.json')
      .then((response) => response.json())
      .then((data) => {
        const user = data['00'] || {};
        setUserData({
          addedLocations: user.addedLocations || [],
          likedLocations: user.likedLocations || [],
          visitedLocations: user.visitedLocations || [],
        });
      })
      .catch((error) => {
        console.error('Error loading user data:', error);
      });
  }, []);

  // Fetch and parse the CSV file for location data
  useEffect(() => {
    fetch('/locationData/dataset.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          complete: (result) => {
            setLocations(result.data);
          },
          header: true,
        });
      })
      .catch((error) => {
        console.error('Error loading CSV data:', error);
      });
  }, []);

  const handleAction = (locationName, action) => {
    fetch('/api/updateUserData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '00', // Use the actual user ID
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

  return (
    <div className={styles.locationGrid}>
      {locations.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.gridContainer}>
          {locations.map((location, index) => (
            <div key={index} className={styles.locationCard}>
              <img src={location.url} alt={location.Name} />
              <h3>{location.Name}</h3>
              <p>{location.Category}</p>
              <p>{location.Location}</p>
              <div className={styles.buttons}>
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
                <Button
                  label="Already Visited"
                  onClick={() =>
                    userData.visitedLocations.includes(location.Name)
                      ? handleAction(location.Name, 'removeVisit')
                      : handleAction(location.Name, 'visit')
                  }
                  disabled={false}
                  isVisited={userData.visitedLocations.includes(location.Name)}
                />
                {/* New "More Details" button to navigate to the location page */}
                <Link href={`/locations/${encodeURIComponent(location.Name)}`} passHref>
                  <Button label="More Details" onClick={() => {}} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllLocation;
