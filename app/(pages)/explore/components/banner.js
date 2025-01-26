import styles from "./banner.module.css"

export default function ExploreBanner() {
  return (
    <div>
      <main>
        <div className={styles.banner}>
        <h1 className={styles.h1Text}>DESTINATION</h1>
        <h6 className={styles.h6Text}>EXPLORE NEW HORIZONS</h6>
        <h2 className={styles.h2Text}>Explore the World <br />Through Traveler Eye</h2>
        <p className={styles.pText}>Discover unforgettable journeys and hidden gems sahred by explores like you.</p>
        </div>
      </main>
    </div>
  );
}
