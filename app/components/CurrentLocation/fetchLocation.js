import axios from 'axios';

// Replace with your preferred geocoding API (Google Maps or OpenCage)
const API_KEY = 'YOUR_API_KEY'; // Replace with actual API key

const getLocation = async () => {
  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use a geocoding API to get the city name from the coordinates
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
            );
            const city = response.data.results[0]?.components?.city || 'City not found';
            resolve(city);
          } catch (error) {
            reject('Failed to get city name.');
          }
        },
        (error) => {
          reject('Failed to retrieve location.');
        }
      );
    });
  } else {
    return Promise.reject('Geolocation is not supported by this browser.');
  }
};

export default getLocation;
