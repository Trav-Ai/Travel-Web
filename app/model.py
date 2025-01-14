import json
import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
import warnings
from sklearn.metrics import precision_score, recall_score, f1_score
import sys

# Disable TensorFlow optimizations and suppress warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
warnings.filterwarnings('ignore', category=UserWarning, module='tensorflow')

# Load dataset of locations
def load_dataset(csv_path):
    try:
        return pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

# Load user data (liked and added locations)
def load_user_data(json_path):
    try:
        with open(json_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading user data: {e}")
        return None

# Generate text embedding using the Sentence Transformer model
def generate_embedding(text, model):
    return model.encode(text)

# Recommend similar locations based on liked and visited locations
def recommend_similar_locations(user_data, dataset, model, top_k=5):
    user_key = "00"
    user = user_data.get(user_key, {})

    liked_locations = user.get("likedLocations", [])
    visited_locations = user.get("visitedLocations", [])
    current_location = user.get("currentLocation", None)

    # Combine liked and visited locations into one list
    locations_of_interest = liked_locations + visited_locations

    if not locations_of_interest:
        print("No liked or visited locations available to generate recommendations.")
        return {}

    # Create a dictionary to hold embeddings for each location in the dataset
    location_embeddings = {}

    for _, row in dataset.iterrows():
        description = row['Description']
        category = row['Category']
        location_text = f"{description} {category}"  # Combine description and category for embedding
        location_embeddings[row['Name']] = generate_embedding(location_text, model)

    # Combine embeddings of the liked and visited locations
    combined_embedding = np.zeros(location_embeddings[next(iter(location_embeddings))].shape)

    for location in locations_of_interest:
        if location not in location_embeddings:
            continue
        combined_embedding += location_embeddings[location]  # Sum up embeddings

    # Normalize the combined embedding
    if len(locations_of_interest) > 0:
        combined_embedding /= len(locations_of_interest)

    # Calculate similarities for all locations with the combined embedding
    similarities = []

    for name, embedding in location_embeddings.items():
        if name in locations_of_interest:
            continue  # Skip the locations already in the list of interest

        similarity_score = cosine_similarity([combined_embedding], [embedding])[0][0]
        similarities.append((name, similarity_score))

    # Sort by similarity score and select the top-k most similar locations
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_similar_locations = similarities[:top_k]

    return top_similar_locations

# Save updated recommendations to user data file
def save_user_data(user_data, json_path):
    try:
        with open(json_path, 'w') as f:
            json.dump(user_data, f, indent=4)
        print(f"Recommendations saved successfully to {json_path}")
    except Exception as e:
        print(f"Error saving user data: {e}")



def main(user_id):
    # Define paths to user data and location dataset
    user_data_path = r'C:\Users\melvi\Desktop\Travel App\travel_web\public\userData\userData.json'
    dataset_path = r'C:\Users\melvi\Desktop\Travel App\travel_web\public\locationData\dataset.csv'

    # Load the datasets
    dataset = load_dataset(dataset_path)
    user_data = load_user_data(user_data_path)

    # Check if dataset or user_data is empty or None
    if dataset is None or dataset.empty or user_data is None:
        print("Error: Dataset or user data is missing or empty.")
        return "Error: Dataset or user data is missing or empty."

    # Initialize the model (Sentence Transformer)
    model = SentenceTransformer('all-MiniLM-L12-v2')

    # Generate recommendations for the user based on liked/added/visited locations
    recommendations = recommend_similar_locations(user_data, dataset, model)

    if not recommendations:
        print("No recommendations generated.")
        return "No recommendations generated."

    # Add recommendations to user data (just append them)
    if user_id not in user_data:
        print(f"Error: User ID {user_id} not found in user data.")
        return f"Error: User ID {user_id} not found in user data."

    user_key = user_id
    if 'recommended' not in user_data[user_key]:
        user_data[user_key]["recommended"] = []

    # Avoid adding locations that are already in recommended, liked, or visited
    recommended_set = set(user_data[user_key]["recommended"])
    for sim_location, _ in recommendations:
        if sim_location not in recommended_set:
            user_data[user_key]["recommended"].append(sim_location)

    # Save the updated user data
    save_user_data(user_data, user_data_path)

    # Output the recommendations
    print("\nTop 5 recommendations:")
    current_location = user_data[user_key].get("currentLocation", "")
    for sim_location, sim_score in recommendations:
        label = "(top)" if current_location and sim_location in user_data[user_key]["recommended"] and \
                            current_location.lower() == dataset[dataset['Name'] == sim_location]['Location'].values[0].lower() else ""
        print(f"  - {sim_location} (Similarity: {sim_score:.4f}) {label}")

    return "Model executed successfully. Recommendations updated."  # Add success message

if __name__ == '__main__':
    # Pass user_id as command line argument
    if len(sys.argv) < 2:
        print("Error: User ID not provided.")
    else:
        user_id = sys.argv[1]
        result = main(user_id)
        print(result)
