import React, { useState } from "react";
import { db } from "@/lib/firebaseConfig"; // import your Firebase config
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore"; // import Firestore functions

const FetchDataButton = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newArrayItem, setNewArrayItem] = useState(""); // State to store the item to add to the array
  const [userID, setUserID] = useState(""); // User ID to target specific user

  const fetchDataFromFirebase = async () => {
    setLoading(true);
    setError(null);

    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const fetchedData = querySnapshot.docs.map((doc) => doc.data());
      setData(fetchedData);
    } catch (err) {
      setError("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addArrayItemToUser = async () => {
    if (!userID || !newArrayItem) {
      alert("Please provide both userID and the item to add.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", userID); // Get reference to user document using userID
      await updateDoc(userDocRef, {
        arrayField: arrayUnion(newArrayItem), // Add item to the array
      });
      alert("Item added successfully!");
    } catch (err) {
      setError("Error adding item to array");
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={fetchDataFromFirebase}>Fetch Data</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <div>
        <h3>Fetched Data:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      <div>
        <h3>Add Item to User's Array:</h3>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter item to add"
          value={newArrayItem}
          onChange={(e) => setNewArrayItem(e.target.value)}
        />
        <button onClick={addArrayItemToUser}>Add Item</button>
      </div>
    </div>
  );
};

export default FetchDataButton;
