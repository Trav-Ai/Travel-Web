'use client'
import { useState, useEffect } from 'react';
import getLocation from './fetchLocation'; // Import the utility function

const LocationComponent = () => {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const userCity = await getLocation(); // Fetch the user's location
        setCity(userCity); // Update state with the city
      } catch (err) {
        setError(err); // Handle error
      }
    };

    fetchLocation(); // Trigger location fetch when the component mounts
  }, []);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {city ? (
        <p>Your current city is: <strong>{city}</strong></p>
      ) : (
        <p>Loading your location...</p>
      )}
    </div>
  );
};

export default LocationComponent;
