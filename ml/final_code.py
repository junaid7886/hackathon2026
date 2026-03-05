"""
Disease Prediction ML Model Training
Trains a model to predict diseases based on symptoms
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'training')
MODEL_DIR = os.path.join(BASE_DIR, 'ml', 'models')

# Create models directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

def load_data():
    """Load training and testing data"""
    print("Loading data...")
    
    # Try different encodings for the CSV files
    encodings = ['utf-8', 'latin-1', 'cp1252']
    
    train_df = None
    test_df = None
    
    for encoding in encodings:
        try:
            train_path = os.path.join(DATA_DIR, 'Training.csv.xls')
            train_df = pd.read_csv(train_path, encoding=encoding)
            print(f"Training data loaded with {encoding} encoding")
            break
        except:
            continue
    
    for encoding in encodings:
        try:
            test_path = os.path.join(DATA_DIR, 'Testing.csv.xls')
            test_df = pd.read_csv(test_path, encoding=encoding)
            print(f"Testing data loaded with {encoding} encoding")
            break
        except:
            continue
    
    if train_df is None:
        raise FileNotFoundError("Could not load training data")
    
    return train_df, test_df

def preprocess_data(train_df, test_df=None):
    """Preprocess the data for training"""
    print("Preprocessing data...")
    
    # The last column is the target (prognosis/disease)
    # All other columns are symptoms (binary features)
    
    # Clean column names
    train_df.columns = train_df.columns.str.strip()
    
    # Drop any unnamed columns
    train_df = train_df.loc[:, ~train_df.columns.str.contains('^Unnamed')]
    
    # Find the target column (usually 'prognosis' or last column)
    if 'prognosis' in train_df.columns:
        target_col = 'prognosis'
    else:
        target_col = train_df.columns[-1]
    
    # Separate features and target
    X_train = train_df.drop(columns=[target_col])
    y_train = train_df[target_col].str.strip()
    
    # Handle missing values - fill NaN with 0 (symptom not present)
    X_train = X_train.fillna(0)
    
    # Convert to numeric and handle any non-numeric values
    X_train = X_train.apply(pd.to_numeric, errors='coerce').fillna(0)
    
    # Get symptom names
    symptoms = list(X_train.columns)
    
    # Get unique diseases
    diseases = sorted(y_train.unique())
    
    print(f"Number of symptoms: {len(symptoms)}")
    print(f"Number of diseases: {len(diseases)}")
    print(f"Training samples: {len(X_train)}")
    
    if test_df is not None:
        test_df.columns = test_df.columns.str.strip()
        # Drop any unnamed columns
        test_df = test_df.loc[:, ~test_df.columns.str.contains('^Unnamed')]
        X_test = test_df.drop(columns=[target_col])
        y_test = test_df[target_col].str.strip()
        # Handle missing values in test data
        X_test = X_test.fillna(0)
        X_test = X_test.apply(pd.to_numeric, errors='coerce').fillna(0)
        # Align columns with training data
        X_test = X_test.reindex(columns=X_train.columns, fill_value=0)
        return X_train, y_train, X_test, y_test, symptoms, diseases
    
    return X_train, y_train, None, None, symptoms, diseases

def train_models(X_train, y_train):
    """Train multiple models and select the best one"""
    print("\nTraining models...")
    
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
    }
    
    best_model = None
    best_score = 0
    best_name = ""
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, n_jobs=-1)
        mean_score = cv_scores.mean()
        
        print(f"  Cross-validation accuracy: {mean_score:.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        if mean_score > best_score:
            best_score = mean_score
            best_name = name
            model.fit(X_train, y_train)
            best_model = model
    
    print(f"\nBest model: {best_name} with accuracy: {best_score:.4f}")
    
    return best_model, best_name

def evaluate_model(model, X_test, y_test):
    """Evaluate model on test data"""
    print("\nEvaluating model on test data...")
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Test Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return accuracy

def save_model(model, symptoms, diseases, model_name):
    """Save the trained model and metadata"""
    print("\nSaving model...")
    
    # Save the model
    model_path = os.path.join(MODEL_DIR, 'disease_predictor.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    # Save metadata (symptoms list and diseases)
    metadata = {
        'symptoms': symptoms,
        'diseases': diseases,
        'model_name': model_name
    }
    
    metadata_path = os.path.join(MODEL_DIR, 'metadata.pkl')
    with open(metadata_path, 'wb') as f:
        pickle.dump(metadata, f)
    
    print(f"Model saved to: {model_path}")
    print(f"Metadata saved to: {metadata_path}")

def predict_disease(symptoms_input, model=None, metadata=None):
    """
    Predict disease based on symptoms
    
    Args:
        symptoms_input: List of symptom names present in the patient
        model: Trained model (loads from file if None)
        metadata: Model metadata (loads from file if None)
    
    Returns:
        Dictionary with predicted disease and confidence
    """
    if model is None:
        model_path = os.path.join(MODEL_DIR, 'disease_predictor.pkl')
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
    
    if metadata is None:
        metadata_path = os.path.join(MODEL_DIR, 'metadata.pkl')
        with open(metadata_path, 'rb') as f:
            metadata = pickle.load(f)
    
    symptoms = metadata['symptoms']
    
    # Create feature vector
    feature_vector = np.zeros(len(symptoms))
    
    for symptom in symptoms_input:
        symptom_clean = symptom.lower().strip().replace(' ', '_')
        if symptom_clean in symptoms:
            idx = symptoms.index(symptom_clean)
            feature_vector[idx] = 1
    
    # Make prediction
    feature_vector = feature_vector.reshape(1, -1)
    prediction = model.predict(feature_vector)[0]
    
    # Get probability if available
    confidence = None
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(feature_vector)[0]
        confidence = max(proba)
    
    return {
        'disease': prediction,
        'confidence': confidence,
        'symptoms_matched': sum(feature_vector[0])
    }

def main():
    """Main training pipeline"""
    print("=" * 50)
    print("Disease Prediction Model Training")
    print("=" * 50)
    
    # Load data
    train_df, test_df = load_data()
    
    # Preprocess
    X_train, y_train, X_test, y_test, symptoms, diseases = preprocess_data(train_df, test_df)
    
    # Train models
    best_model, model_name = train_models(X_train, y_train)
    
    # Evaluate on test set if available
    if X_test is not None and y_test is not None:
        evaluate_model(best_model, X_test, y_test)
    
    # Save model
    save_model(best_model, list(X_train.columns), diseases, model_name)
    
    # Test prediction
    print("\n" + "=" * 50)
    print("Testing prediction...")
    print("=" * 50)
    
    test_symptoms = ['itching', 'skin_rash', 'nodal_skin_eruptions']
    result = predict_disease(test_symptoms, best_model, {'symptoms': list(X_train.columns), 'diseases': diseases})
    
    print(f"Test symptoms: {test_symptoms}")
    print(f"Predicted disease: {result['disease']}")
    print(f"Confidence: {result['confidence']:.2%}" if result['confidence'] else "")
    
    print("\nTraining complete!")

if __name__ == "__main__":
    main()
