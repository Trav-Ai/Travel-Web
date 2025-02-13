import React, { useState, useEffect } from 'react';
import styles from './searchBar.module.css';

export default function SearchBar({ onSearch, query }) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (event) => {
        const newSearchQuery = event.target.value;
        setSearchQuery(newSearchQuery); // Update state with new value
        onSearch(newSearchQuery); // Pass search query to parent component
    };
    
    useEffect(() => {
        if (query) {
            setSearchQuery(query);
        }
    }, [query]);

    const handleClearSearch = () => {
        setSearchQuery(""); // Clear search query
        onSearch(""); // Notify parent component to reset locations or results
    };

    return (
        <div className={styles.group}>
            <div className={styles.container}>
                <svg className={styles.icon} aria-hidden="true" viewBox="0 0 24 24">
                    <g>
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                    </g>
                </svg>

                <input
                    placeholder="Search for your Perfect Destination"
                    type="text"
                    className={styles.input}
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                
                {searchQuery ? (
                    <button className={styles.cross} onClick={handleClearSearch}>
                        <span>&times;</span>
                    </button>
                ) : null}   

                <button className={styles.button}>Search</button>
            </div>
        </div>
    );
}
