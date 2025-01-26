import pandas as pd
import numpy as np
from transformers import BertTokenizer, BertModel
from sklearn.model_selection import train_test_split
import torch
import torch.nn as nn
import torch.optim as optim
from tqdm import tqdm

# Load data
user_data_path = r'C:\Users\melvi\Desktop\Travel App\travel_web\public\userData\userData.json'
dataset_path = r'C:\Users\melvi\Desktop\Travel App\travel_web\public\locationData\dataset.csv'
test_data_path = r'C:\Users\melvi\Desktop\Travel App\travel_web\public\userData\test_data.json'

user_data = pd.read_json(user_data_path)
test_data = pd.read_json(test_data_path)
location_data = pd.read_csv(dataset_path)

# Prepare data
def preprocess_data(user_data, location_data):
    """
    Preprocesses user and location data for BERT4Rec.

    Args:
        user_data: DataFrame containing user data.
        location_data: DataFrame containing location data.

    Returns:
        user_ids: List of unique user IDs.
        item_ids: List of unique location IDs.
        user_item_matrix: Sparse matrix representing user-item interactions.
        item_embeddings: Dictionary of item embeddings.
    """
    user_ids = user_data.index.tolist()
    item_ids = location_data['Name'].tolist()

    # Create user-item interaction matrix
    user_item_matrix = np.zeros((len(user_ids), len(item_ids)))
    for i, user in enumerate(user_data.iterrows()):
        user_id = user[0]
        user_idx = user_ids.index(user_id)
        for item in user[1]['likedLocations']:
            item_idx = item_ids.index(item)
            user_item_matrix[user_idx, item_idx] = 1

    # Get item embeddings (you'll need to train these separately)
    # For this example, we'll use random embeddings
    item_embeddings = {item: np.random.rand(128) for item in item_ids} 

    return user_ids, item_ids, user_item_matrix, item_embeddings

user_ids, item_ids, user_item_matrix, item_embeddings = preprocess_data(user_data, location_data)

# Split data into train and test sets
train_user_item_matrix, test_user_item_matrix = train_test_split(
    user_item_matrix, test_size=0.2, random_state=42
)

# Define BERT4Rec model
class BERT4Rec(nn.Module):
    def __init__(self, vocab_size, hidden_size, num_layers, dropout):
        super(BERT4Rec, self).__init__()
        self.bert = BertModel.from_pretrained('bert-base-uncased') 
        self.fc = nn.Linear(hidden_size, vocab_size)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        last_hidden_state = outputs[0] 
        pooled_output = last_hidden_state[:, 0, :] 
        logits = self.fc(pooled_output)
        return logits

# Initialize model and optimizer
vocab_size = len(item_ids)
hidden_size = 768
num_layers = 12
dropout = 0.1
model = BERT4Rec(vocab_size, hidden_size, num_layers, dropout)
optimizer = optim.Adam(model.parameters(), lr=1e-3)

# Training loop
num_epochs = 10
batch_size = 32

def train_epoch(model, optimizer, train_data, item_embeddings):
    model.train()
    total_loss = 0
    for i in tqdm(range(0, len(train_data), batch_size)):
        batch = train_data[i:i+batch_size]
        # Prepare input for BERT (you'll need to convert user history to sequence)
        input_ids = torch.tensor(batch) 
        attention_mask = torch.ones_like(input_ids) 
        optimizer.zero_grad()
        outputs = model(input_ids, attention_mask)
        # Calculate loss (e.g., cross-entropy loss)
        loss = nn.CrossEntropyLoss()(outputs, torch.tensor(batch)) 
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(train_data)

# # Evaluate model
# def evaluate(model, test_data, item_embeddings):
#     model.eval()
#     with torch.no_grad():
#         # Make predictions for test data
#         # ... 
#         # Calculate metrics (e.g., precision, recall, NDCG)
#         # ... 
#     return metrics

# Train and evaluate the model
for epoch in range(num_epochs):
    train_loss = train_epoch(model, optimizer, train_user_item_matrix, item_embeddings)
    print(f"Epoch {epoch+1}/{num_epochs}, Train Loss: {train_loss}")
    # metrics = evaluate(model, test_user_item_matrix, item_embeddings)
    # print(f"Epoch {epoch+1}/{num_epochs}, Evaluation Metrics: {metrics}")

# Make recommendations for new user
def recommend(user_id, model, item_embeddings, top_k=10):
    # Get user history (if available)
    user_history = user_data.loc[user_id]['likedLocations'] 
    # Prepare input for BERT (convert user history to sequence)
    # ...
    # Get model predictions
    predictions = model(...) 
    # Get top-k recommendations
    top_k_indices = np.argsort(predictions)[-top_k:]
    recommendations = [item_ids[idx] for idx in top_k_indices]
    return recommendations

# Example usage
new_user_id = 'Melvin'
recommendations = recommend(new_user_id, model, item_embeddings)
print(f"Recommendations for {new_user_id}: {recommendations}")