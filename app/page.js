'use client'
import Image from "next/image";
import AllLocation from "./components/Locations/allLocations";
import RecommendedLocations from "./components/Locations/recLocs.js";
import ExecuteModelButton from "./components/modelButton/modelButton";
import LocationComponent from "./components/CurrentLocation/LocationComponent";
import styles from "./home.module.css";
import ChatBot from "./components/temp";
import Navbar from "./components/NavBar/navbar";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/AuthContext";
import Footer from "./components/Footer/footer";
import Cookies from "js-cookie";
import { auth } from "@/lib/firebaseConfig";
import Link from "next/link";


export default function Home() {

  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const idToken = Cookies.get('authToken');

      if (idToken) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUser(user);
            setUserID(user.uid);
            console.log('User is authenticated:', user.uid);
          } else {
            setUser(null);
            console.log('No user is authenticated.');
          }
        });

        return () => unsubscribe();
      } else {
        setUser(null);
        console.log('No user is authenticated.');
      }
    };

    checkAuthentication();
  }, []);

  //Updating userID when Logging out
  useEffect(() => {
    const idToken = Cookies.get('authToken');

    if (!idToken) {
      setUser(null);
      setUserID(null);
    }
  }, [user, userID]);

  return (
    <AuthProvider>
      <Navbar />


      <main className={styles.main}>

        <section className={styles.heroSection}>
          <div className={styles.heroInfo}>
            <div className={styles.heroSubtext1}>
              <p>Ai Integrated Travel Recommendations</p>
            </div>
            <div className={styles.adventure1}>
              <h1>Adventure</h1>
              <h1>Awaits!</h1>
            </div>
            <div className={styles.heroSubtext}>
              <p>Let AI be your compass as you conquer challenges, explore new horizons and earn exciting rewards!</p>
            </div>
            <Link href="/explore" passHref>
              <button className={styles.roundedButton}>Start Exploring</button>
            </Link>
          </div>
          <div className={styles.imageLayout}>
            <div className={styles.leftColumn}>
              <img src="/images/ocean.jpg" alt="Beach view" className={styles.large} />
              <img src="/images/building.jpg" alt="Architecture" className={styles.small} />
            </div>
            <div className={styles.rightColumn}>
              <img src="/images/hotair.jpeg" alt="Hot air balloons" className={styles.small} />
              <img src="/images/taj.jpg" alt="Monument" className={styles.large} />
            </div>
          </div>
        </section>


        <section className={styles.destinationsSection}>
          <div className={styles.destinationHeader}>
            <h2>Find Popular Destinations</h2>
            <div className={styles.roundedButton}>
              <Link href="/explore" passHref>
                <button >Explore Destinations</button>
              </Link>
            </div>
          </div>
          <div className={styles.destinationGrid}>
            <AllLocation limit={4} filter={'top'} userID={userID} />
          </div>
        </section>


        <section className={styles.categoriesSection}>
          <div className={styles.g}>
            <div className={styles.g1}>
              <h1>Categories</h1>
              <h2>Here are lots of interesting destinations to visit</h2>
              <h2> but don't be confused - they're already</h2>
              <h2>grouped by category.</h2>
            </div>
            <div className={styles.ArrowButtons}>
              <img src="/images/leftarrow.png" alt="Left" />
              <img src="/images/arrow.png" alt="Right" />
            </div>
          </div>


          <div className={styles.categoryGrid}>
            <div className={styles.categoryCard}>
              <Link href={`/explore?category=${'Beach'}`} passHref>
                <Image src="/images/beach.webp" alt="Beach" width={200} height={200} />
                <h3>Beach</h3>
              </Link>
            </div>
            <div className={styles.categoryCard}>
              <Link href={`/explore?category=${'Hill Station'}`} passHref>
                <Image src="/images/mountains.jpeg" alt="Hill Stations" width={200} height={200} />
                <h3>Hill Stations</h3>
              </Link>
            </div>
            <div className={styles.categoryCard}>
              <Link href={`/explore?category=${'Cultural'}`} passHref>
                <Image src="/images/cultural.jpg" alt="Cultural" width={200} height={200} />
                <h3>Cultural</h3>
              </Link>
            </div>
            <div className={styles.categoryCard}>
              <Link href={`/explore?category=${'Waterfalls'}`} passHref>
                <Image src="/images/waterfall.jpg" alt="Waterfalls" width={200} height={200} />
                <h3>Waterfalls</h3>
              </Link>
            </div>
            <div className={styles.categoryCard}>
              <Link href={`/explore?category=${'Waterfalls'}`} passHref>
                <Image src="/images/nature.jpeg" alt="Forest" width={200} height={200} />
                <h3>Nature</h3>
              </Link>
            </div>
          </div>
        </section>


        <section className={styles.servicesSection}>
          <div className={styles.serviceHeader}>
            <h2>We Offer Best Services</h2>
            <div className={styles.ArrowButtons}>
              <img src="/images/leftarrow.png" alt="Left" />
              <img src="/images/arrow.png" alt="Right" />
            </div>
          </div>
          <div className={styles.serviceGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.icon}>
                <img src="/images/star.png" alt="AI Travel Recommendations" />
              </div>
              <h3>AI Travel Recommendations</h3>
              <p>Receive personalized recommendations for the best locations.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.icon}>
                <img src="/images/chat.png" alt="Instant Chatbot Assistance" />
              </div>
              <h3>Instant Chatbot Assistance</h3>
              <p>Get instant travel support anytime, anywhere.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.icon}>
                <img src="/images/itenary.png" alt="Tailored Itinerary Generator" />
              </div>
              <h3>Tailored Itinerary Generator</h3>
              <p>Create personalized travel plans in few minutes.</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.icon}>
                <img src="/images/social.png" alt="Social Media Showcase" />
              </div>
              <h3>Social Media Showcase</h3>
              <p>Share your travel achievements and milestones globally.</p>
            </div>
          </div>
        </section>




        <section className={styles.workSection}>
          <div className={styles.imageContainer}>
            <Image src="/images/girl.jpg" alt="Landscape" className={styles.workImage} width={500} height={500} />
            <h1>Embark on a journey to find your dream destinations.</h1>
          </div>
          <div className={styles.stepCard}>
            <h1>How it works</h1>
            <h2>One click for you</h2>

            <Link href="/explore" passHref>
              <div className={styles.workCard}>
                {/* <img src="/images/search.png" alt="Compass Icon" className={styles.workIcon} /> */}
                <div className={styles.workNumber}><h1>1</h1></div>
                <div className={styles.cardContent}>
                  <strong>Find Your Destination</strong>
                  <p>Embark on a journey to discover your dream destination, where adventure and relaxation await.</p>
                </div>
                {/* <img src="/images/arrow.png" alt="Arrow Icon" className={styles.arrowImg} /> */}
              </div>
            </Link>
            
            <div className={styles.workCard}>
              <div className={styles.workNumber}><h1>2</h1></div>
              <div className={styles.cardContent}>
                <strong>Generate Your Itinerary</strong>
                <p>Use our tool to generate a fully personalized itinerary, tailored to your unique travel style and needs.</p>
              </div>

            </div>

            <div className={styles.workCard}>
              <div className={styles.workNumber}><h1>3</h1></div>
              <div className={styles.cardContent}>
                <strong>Plan Your Trip</strong>
                <p>Get detailed recommendations and helpful tips for planning every aspect of your journey.</p>
              </div>

            </div>

            <div className={styles.workCard}>
              <div className={styles.workNumber}><h1>4</h1></div>
              <div className={styles.cardContent}>
                <strong>Explore the Destination</strong>
                <p>Once you arrive, explore your chosen destination with ease, enjoying every moment of your adventure.</p>
              </div>

            </div>

          </div>
        </section>



        <Footer />
      </main>

      <ChatBot />
    </AuthProvider >
  );
}
