'use client';

import styles from './itinerary.module.css'; // Importing the CSS module
import React, { useState } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import { marked } from 'marked';
import Navbar from '@/app/components/NavBar/navbar';
import { AuthProvider } from '@/hooks/AuthContext';
import Loader from './components/loader';
import ContentSection from './components/contentSection';


export default function Itinerary() {
    const [boardingPoint, setBoardingPoint] = useState('');
    const [destination, setDestination] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false); // Flag to hide the form after submission
    const [errorMessage, setErrorMessage] = useState(''); // For handling error messages

    const [markdownContent, setMarkdownContent] = useState();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if required fields are filled
        if (!boardingPoint || !destination || !travelDate) {
            alert('Please fill in all mandatory fields (Boarding Point, Destination, and Travel Date)');
            return;
        }

        const travelDateObj = new Date(travelDate);
        const returnDateObj = new Date(returnDate);

        // Check if the return date is before the travel date
        const no_of_day = (returnDateObj - travelDateObj) / (1000 * 3600 * 24); // Difference in days

        if (no_of_day < 0) {
            setErrorMessage('Error: Return date cannot be earlier than travel date.');
            return;
        } else {
            setErrorMessage(''); // Clear the error message if the dates are valid
        }

        const itineraryDetails = {
            boardingPoint,
            destination,
            travelDate,
            returnDate,
            no_of_day, // Add the number of days to the itinerary details
        };

        setLoading(true);

        try {
            // Make API call to the backend (replace with your backend URL)
            const response = await fetch('//13.126.69.100:5000/generateItinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itineraryDetails),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Itinerary generated:', data);
                (data.plan);

                const processedContent = await remark()
                    .use(html)
                    .process(data.plan);
                setMarkdownContent(marked((processedContent.toString())));

                setApiResponse(data); // Store the response data
                setFormSubmitted(true); // Hide the form after submission
            } else {
                console.error('Failed to generate itinerary');
                setErrorMessage('Failed to generate itinerary, please try again later.');
            }
        } catch (error) {
            console.error('Error while making the API call:', error);
            setErrorMessage('Error while making the API call. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthProvider >
            <div className={styles.body}>
                <Navbar />

                {/* Show the form until it's submitted */}
                {!formSubmitted && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.header}>
                            <h1>Generate Itinerary</h1>
                            {loading ?
                                <div className={styles.loader}><Loader /></div>
                                : null
                            }
                        </div>
                        <div className={styles.locationField}>
                            <div className={styles.formGroup}>
                                <label htmlFor="boardingPoint" className={styles.label}>Boarding Point</label>
                                <input
                                    type="text"
                                    id="boardingPoint"
                                    value={boardingPoint}
                                    onChange={(e) => setBoardingPoint(e.target.value)}
                                    placeholder="Enter boarding point"
                                    autoComplete="off"
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="destination" className={styles.label}>Destination</label>
                                <input
                                    type="text"
                                    id="destination"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="Enter destination"
                                    autoComplete="off"
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.dateField}>
                            <div className={styles.formGroup}>
                                <label htmlFor="travelDate" className={styles.label}>Travel Date</label>
                                <input
                                    type="date"
                                    id="travelDate"
                                    value={travelDate}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    autoComplete="off"
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="returnDate" className={styles.label}>Return Date</label>
                                <input
                                    type="date"
                                    id="returnDate"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    autoComplete="off"
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>} {/* Show error message */}
                        <div className={styles.formGroup}>
                            <button type="submit" disabled={loading} className={styles.submitButton}>
                                {loading ? 'Generating Itinerary...' : 'Generate Itinerary'}
                            </button>
                        </div>
                    </form>
                )}


                {/* Display the results after form submission */}
                {formSubmitted && apiResponse && (
                    <div className={styles.resultSection}>
                        <div className={styles.resultHeader}>
                            <h1>Itinerary Details</h1>
                            <h5><b>Location:</b> {apiResponse.weather_data.resolvedAddress}</h5>
                        </div>
                        {/* Display Weather Data */}
                        {apiResponse.weather_data && (
                            <div className={styles.weatherData}>
                                <h1>Weather Information</h1>

                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Travel Dates</th>
                                            <th>Current Weather Conditions</th>
                                            <th>Max Temperature (in °C)</th>
                                            <th>Min Temperature (in °C)</th>
                                            <th>Precipitation Probability</th>
                                            <th>Humidity</th>
                                            <th>Weather Alerts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {apiResponse.weather_data.days.map((weather_data_item, index) => (
                                            <tr key={index}>
                                                <td>{weather_data_item.datetime}</td>
                                                <td>{weather_data_item.conditions}</td>
                                                <td>{weather_data_item.tempmax}</td>
                                                <td>{weather_data_item.tempmin}</td>
                                                <td>{weather_data_item.precipprob}</td>
                                                <td>{weather_data_item.humidity}</td>
                                                <td>{weather_data_item.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}


                        {/* Display Plan */}
                        {apiResponse.plan && (
                            <div className={styles.planData}>
                                <h3 className={styles.planHeader}>Personalized Trip Itinerary</h3>

                                {/* Markdown content rendered using react-markdown */}
                                <div className={styles.markdownContent} dangerouslySetInnerHTML={{ __html: markdownContent }}>
                                </div>
                            </div>
                        )}
                        <ContentSection />
                    </div>
                )}


            </div>
        </AuthProvider>
    );
}
