'use client'
// components/AllLocation.js

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Link from 'next/link'; // Import Link component
import styles from './allLocation.module.css'; // Import CSS module

const AllLocation = () => {
  const [locations, setLocations] = useState([]);

  // Fetch and parse the CSV file when the component mounts
  useEffect(() => {
    // Fetch the CSV file from the public/data folder
    fetch('/data/dataset.csv')
      .then((response) => response.text())
      .then((csvText) => {
        // Parse the CSV data into an array of objects
        Papa.parse(csvText, {
          complete: (result) => {
            // Assuming CSV has headers like 'location_name', 'image', 'category', 'location'
            setLocations(result.data);
          },
          header: true, // Treats first row as headers
        });
      });
  }, []);

  return (
    <div className={styles.locationGrid}>
      {locations.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.gridContainer}>
          {locations.map((location, index) => (
            <Link href={`/locations/${encodeURIComponent(location.Name)}`} key={index}>
              <div className={styles.locationCard}>
                <img src={location.url} alt={location.Name} />
                <h3>{location.Name}</h3>
                <p>{location.Category}</p>
                <p>{location.Location}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllLocation;
