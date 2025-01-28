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


export default function Home() {

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
            <button className={styles.startExploring}>Start Exploring <span className={styles.arrow}>→</span></button>
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


        <section className={styles.servicesSection}>
          <div className={styles.serviceHeader}>
            <h2>We Offer Best Services</h2>
            <div className={styles.serviceArrowButtons}>
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
            <img src="/images/girl.png" alt="Landscape" className={styles.workImage} />
            <h1>Embark on a journey to find your dream destinations.</h1>
          </div>
          <div className={styles.buttonSection}>
            <div className={styles.stepCard}>
              <h1>How it works</h1>
              <h2>One click for you</h2>

              <div className={styles.buttonGroup}>
                <div className={styles.buttonPlay}>
                  <button className={styles.button1}>
                    <div className={styles.buttonContainer}>
                      <span className={styles.searchIcon}>
                        <img src="/images/search.png" alt="Compass Icon" />
                      </span>
                      <div className={styles.buttonContent}>
                        <strong>Find Your Destination</strong>
                        <p>Embark on a journey to discover your dream destination, where adventure and relaxation await.</p>
                      </div>
                    </div>
                  </button>
                  <div className={styles.arrowImg}>
                    <img src="/images/arrow.png" alt="Arrow Icon" />
                  </div>
                </div>


                <div className={styles.buttonPlay}>
                  <button className={styles.button1}>
                    <div className={styles.buttonContainer}>
                      <span className={styles.searchIcon}>
                        <img src="/images/search.png" alt="Compass Icon" />
                      </span>
                      <div className={styles.buttonContent}>
                        <strong>Generate Your Itinerary</strong>
                        <p>Use our tool to generate a fully personalized itinerary, tailored to your unique travel style and needs.</p>
                      </div>
                    </div>
                  </button>
                  <div className={styles.arrowImg}>
                    <img src="/images/arrow.png" alt="Arrow Icon" />
                  </div>
                </div>


                <div className={styles.buttonPlay}>
                  <button className={styles.button1}>
                    <div className={styles.buttonContainer}>
                      <span className={styles.searchIcon}>
                        <img src="/images/search.png" alt="Compass Icon" />
                      </span>
                      <div className={styles.buttonContent}>
                        <strong>Plan Your Trip</strong>
                        <p>Get detailed recommendations and helpful tips for planning every aspect of your journey.</p>
                      </div>
                    </div></button>
                  <div className={styles.arrowImg}>
                    <img src="/images/arrow.png" alt="Arrow Icon" />
                  </div>
                </div>


                <div className={styles.buttonPlay}>
                  <button className={styles.button1}>
                    <div className={styles.buttonContainer}>
                      <span className={styles.searchIcon}>
                        <img src="/images/search.png" alt="Compass Icon" />
                      </span>
                      <div className={styles.buttonContent}>
                        <strong>Explore the Destination</strong>
                        <p>Once you arrive, explore your chosen destination with ease, enjoying every moment of your adventure.</p>
                      </div>
                    </div></button>
                  <div className={styles.arrowImg}>
                    <img src="/images/arrow.png" alt="Arrow Icon" />
                  </div>
                </div>
              </div>
            </div>
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
            <div className={styles.arrowButtons}>
              <img src="/images/leftarrow.png" alt="Left" className={styles.leftArrow} />
              <img src="/images/arrow.png" alt="Right" className={styles.rightArrow} />
            </div>
          </div>

          <div className={styles.categoryGrid}>

            <div className={styles.categoryCard1}>
              <div className={styles.categoryCard}>
                <img src="/images/beach.webp" alt="Beach" />
              </div>
              <h3>Beach</h3>
            </div>


            <div className={styles.categoryCard1}>
              <div className={styles.categoryCard}>
                <img src="/images/mountains.jpeg" alt="Hill Stations" />
              </div>
              <h3>Hill Stations</h3>
            </div>

            <div className={styles.categoryCard1}>
              <div className={styles.categoryCard}>
                <img src="/images/nature.jpeg" alt="Nature" />
              </div>
              <h3>Nature</h3>
            </div>

            <div className={styles.categoryCard1}>
              <div className={styles.categoryCard}>
                <img src="/images/cultural.jpg" alt="Cultural" />
              </div>
              <h3>Cultural</h3>
            </div>

            <div className={styles.categoryCard1}>
              <div className={styles.categoryCard}>
                <img src="/images/waterfall.jpg" alt="Waterfalls" />
              </div>
              <h3>Waterfalls</h3>
            </div>
          </div>
        </section>



        <section className={styles.destinationsSection}>
          <h2>Find Popular Destinations</h2>
          <div className={styles.destinationGrid}>

            <div className={styles.destinationCard}>
              <img src="/images/ponmudi.webp" />
              <div className={styles.destinationTi}>
                <div className={styles.destinationText}>
                  <h3>Ponumdi</h3>
                  <p>Thiruvanathapuram</p>
                </div>
                <div className={styles.destinationIcon}>
                  <button> <img src="/images/heart.png" alt="Heart" className={styles.heartIcon} /></button>
                  <button>  <img src="/images/add.png" alt="Plus" className={styles.plusIcon} /></button>
                </div></div>
            </div>

            <div className={styles.destinationCard}>
              <img src="/images/allepy.jpg" />
              <div className={styles.destinationTi}>
                <div className={styles.destinationText}>
                  <h3>Shankumugham</h3>
                  <p>Thiruvanathapuram</p>
                </div>
                <div className={styles.destinationIcon}>
                  <button> <img src="/images/heart.png" alt="Heart" className={styles.heartIcon} /></button>
                  <button>  <img src="/images/add.png" alt="Plus" className={styles.plusIcon} /></button>
                </div></div>
            </div>

            <div className={styles.destinationCard}>
              <img src="/images/varkala.webp" />
              <div className={styles.destinationTi}>
                <div className={styles.destinationText}>
                  <h3>Varkala Beach</h3>
                  <p>Thiruvanathapuram</p>
                </div>
                <div className={styles.destinationIcon}>
                  <button> <img src="/images/heart.png" alt="Heart" className={styles.heartIcon} /></button>
                  <button>  <img src="/images/add.png" alt="Plus" className={styles.plusIcon} /></button>
                </div></div>
            </div>



            <div className={styles.destinationCard}>
              <img src="/images/pmg.jpg" />
              <div className={styles.destinationTi}>
                <div className={styles.destinationText}>
                  <h3>PMG</h3>
                  <p>Thiruvanathapuram</p>
                </div>
                <div className={styles.destinationIcon}>
                  <button> <img src="/images/heart.png" alt="Heart" className={styles.heartIcon} /></button>
                  <button>  <img src="/images/add.png" alt="Plus" className={styles.plusIcon} /></button>
                </div></div>
            </div>

          </div>
          <div className={styles.exploreButton}>
            <button >Explore Destinations <span className={styles.arrow}>→</span></button>
          </div>

        </section>



      </main>

      <ChatBot />
    </AuthProvider>
  );
}
