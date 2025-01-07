'use client'

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { use } from 'react'; // Import React.use()
import styles from './LocationDetail.module.css'; // CSS for styling

const LocationDetail = ({ params }) => {
  // Unwrap params and decode the 'name' parameter (which might be URL-encoded)
  const { name } = use(params);
  const decodedName = decodeURIComponent(name); // Decode the name to handle spaces and special characters

  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState(null);  // State to track errors

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        const res = await fetch('/data/dataset.csv');
        if (!res.ok) {
          throw new Error('Failed to fetch data from CSV file.');
        }

        const csvText = await res.text();

        Papa.parse(csvText, {
          complete: (result) => {
            const data = result.data.find((location) => decodeURIComponent(location.Name) === decodedName);
            if (!data) {
              throw new Error('Location not found in dataset.');
            }
            setLocationData(data);
            setError(null); // Reset error if data is found
          },
          header: true,
        });
      } catch (err) {
        setError(err.message);  // Set error message if anything fails
        setLocationData(null);   // Reset location data if there's an error
      }
    };

    if (decodedName) {
      fetchLocationDetails();
    }
  }, [decodedName]); // Use decoded name for fetching location details

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!locationData) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.locationDetail}>
      <h1>{locationData.Name}</h1>
      <img src={locationData.url} alt={locationData.Name} />
      <p><strong>Category:</strong> {locationData.Category}</p>
      <p><strong>Location:</strong> {locationData.Location}</p>
      <p><strong>Description:</strong> {locationData.Description}</p>
    </div>
  );
};

export default LocationDetail;
