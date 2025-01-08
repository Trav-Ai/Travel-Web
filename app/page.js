import Image from "next/image";
import AllLocation from "./components/Locations/allLocations";
import RecommendedLocations from "./components/Locations/recLocs.js";
import styles from "./home.module.css";
import ChatBot from "./components/temp";

export default function Home() {
  return (
    <div className={styles.Home}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <h1 className={styles.navTitle}>Ai Travel App</h1>
        <div className={styles.navLinks}>
        <button className={styles.navButton}>Home</button>
        <button className={styles.navButton}>Itinerary</button>
        <button className={styles.navButton}>Social</button>
          <button className={styles.navButton}>Sign Up</button>
          <button className={styles.navButton}>Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={styles.hero}>
        <Image
          src="/landingpage.jpeg"
          alt="Adventure Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className={styles.backgroundImage}
        />
        <div className={styles.overlay}>
          <h1 className={styles.heroTitle}>Ai Travel App</h1>
          <h2 className={styles.subTitle}>AI Integrated Travel Recommendations</h2>
          <h1 className={styles.mainTitle}>Adventure</h1>
          <p className={styles.description}>
            Let AI be your compass as you conquer challenges, explore new horizons,
            and earn exciting rewards!
          </p>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search for locations..." className={styles.searchInput} />
            <button className={styles.searchButton}>Generate an Itinerary</button>
          </div>
        </div>
      </div>

      {/* Recommended Locations Section */}
      <div className={styles.RecommendedLocations}>
        <h1 className={styles.title}>Recommended Locations</h1>
        <RecommendedLocations />
      </div>

      {/* All Locations Section */}
      <div className={styles.AllLocation}>
        <h1 className={styles.title}>All Locations</h1>
        <AllLocation />
      </div>
      <ChatBot />
    </div>
  );
}
