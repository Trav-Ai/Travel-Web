import Image from "next/image";
import AllLocation from "./components/Locations/allLocations";
import styles from "./home.module.css"
import RecommendedLocations from "./components/Locations/recLocs.js";
import ExecuteModelButton from "./components/modelButton/modelButton";
import LocationComponent from "./components/CurrentLocation/LocationComponent";


const userID = "00";

export default function Home() {

  return (
    <div className={styles.Home}>
      {/* <LocationComponent /> */}
      <div className={styles.RecommendedLocations}>
      <h1 className={styles.title}>Recommended Locations</h1>
      <ExecuteModelButton />
        <RecommendedLocations />
      </div>
      
      <div className={styles.AllLocation}>
      <h1 className={styles.title}>All Locations</h1>
        <AllLocation />
      </div>

    </div>
  );
}
