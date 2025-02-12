from firebase import firebase
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('C:/Users/melvi/Desktop/Travel App/travel_web/lib/firebaseConfig.json')  # Replace with your JSON file path
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Function to retrieve user data by userID
def get_user_data(user_id):
    try:
        # Path to the user document in Firestore
        user_ref = db.collection('users').document(user_id)  # Replace 'users' with your collection name
        
        # Retrieve data from Firestore
        user_data = user_ref.get()
        
        if user_data.exists:
            # Get the user data as a dictionary
            user_dict = user_data.to_dict()
            
            # Check if 'recommended' field exists
            if 'recommended' in user_dict:
                # Clear the existing 'recommended' array
                user_ref.update({'recommended': []})
                print(f"Cleared 'recommended' array for userID: {user_id}")
            else:
                # If 'recommended' does not exist, create it with an empty array
                user_ref.update({'recommended': []})
                print(f"Created 'recommended' array for userID: {user_id}")
            
            return user_dict
        else:
            print(f"No data found for userID: {user_id}")
            return None 
    except Exception as e:
        print(f"Error retrieving user data: {e}")
        return None
 

data = get_user_data('hXgGdyMgCcaTDz8jDzonnylnEWA2')
liked_locations = data.get("likedLocations", [])
print(liked_locations)