'use client'

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import styles from './LocationDetail.module.css'; // Custom styling

const LocationDetail = ({ params }) => {
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      const res = await fetch('/data/dataset.csv');
      const csvText = await res.text();

      Papa.parse(csvText, {
        complete: (result) => {
          const data = result.data.find((location) => location.Name === params.name);
          setLocationData(data);
        },
        header: true,
      });
    };

    fetchLocationDetails();
  }, [params.name]);

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
