import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# --- Configuration ---
DATASET_PATH = 'top_1000_pe_imports.csv'
MODEL_PATH = 'sentinel_model.pkl'
FEATURES_PATH = 'features_list.pkl'

def train_model():
    print(f"Loading dataset from {DATASET_PATH}...")
    try:
        df = pd.read_csv(DATASET_PATH)
    except FileNotFoundError:
        print(f"Error: Dataset not found at {DATASET_PATH}")
        return

    # Check for 'malware' column (target)
    if 'malware' not in df.columns:
        print("Error: 'malware' column not found in dataset.")
        print(f"Available columns: {df.columns.tolist()[:10]}...")
        return

    # Separate features and target
    # The dataset has 'hash', 1000 features, and 'malware'
    # We drop 'hash' and 'malware' for X, keep 'malware' for y
    X = df.drop(['hash', 'malware'], axis=1)
    y = df['malware']
    
    print(f"Dataset shape: {df.shape}")
    print(f"Features: {X.shape[1]}")
    print(f"Samples: {X.shape[0]}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize and train model
    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    # Evaluate
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Save features list (feature names are crucial for mapping later)
    features_list = X.columns.tolist()
    
    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(clf, MODEL_PATH)
    
    print(f"Saving features list to {FEATURES_PATH}...")
    joblib.dump(features_list, FEATURES_PATH)
    
    print("Done.")

if __name__ == "__main__":
    train_model()
