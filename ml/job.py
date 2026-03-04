"""
Disease Prediction Chatbot API
Flask server to serve ML model predictions for the health chatbot
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'ml', 'models')

# Global variables for model and metadata
model = None
metadata = None

# Disease information database (descriptions and recommendations)
DISEASE_INFO = {
    "Fungal infection": {
        "description": "A skin infection caused by fungi",
        "recommendations": [
            "Keep the affected area clean and dry",
            "Use antifungal creams as prescribed",
            "Avoid sharing personal items",
            "Wear loose, breathable clothing"
        ],
        "severity": "mild",
        "see_doctor": "If symptoms persist for more than 2 weeks"
    },
    "Allergy": {
        "description": "An immune system response to a foreign substance",
        "recommendations": [
            "Identify and avoid allergens",
            "Take antihistamines as needed",
            "Keep your environment clean",
            "Consider allergy testing"
        ],
        "severity": "mild to moderate",
        "see_doctor": "If you experience difficulty breathing or severe reactions"
    },
    "GERD": {
        "description": "Gastroesophageal reflux disease - acid reflux condition",
        "recommendations": [
            "Avoid spicy and fatty foods",
            "Eat smaller meals",
            "Don't lie down after eating",
            "Elevate head while sleeping"
        ],
        "severity": "moderate",
        "see_doctor": "If symptoms occur more than twice a week"
    },
    "Chronic cholestasis": {
        "description": "A liver condition affecting bile flow",
        "recommendations": [
            "Follow a low-fat diet",
            "Stay hydrated",
            "Take prescribed medications",
            "Regular liver function tests"
        ],
        "severity": "moderate to severe",
        "see_doctor": "Immediately - requires medical supervision"
    },
    "Drug Reaction": {
        "description": "Adverse reaction to medication",
        "recommendations": [
            "Stop the suspected medication",
            "Note all symptoms",
            "Seek medical attention",
            "Carry a list of drug allergies"
        ],
        "severity": "varies",
        "see_doctor": "Immediately if severe symptoms appear"
    },
    "Peptic ulcer diseae": {
        "description": "Sores in the stomach or small intestine lining",
        "recommendations": [
            "Avoid NSAIDs and aspirin",
            "Limit alcohol and caffeine",
            "Eat regular, balanced meals",
            "Manage stress"
        ],
        "severity": "moderate",
        "see_doctor": "If you experience severe pain or blood in stool"
    },
    "AIDS": {
        "description": "Acquired Immunodeficiency Syndrome",
        "recommendations": [
            "Seek immediate medical care",
            "Follow antiretroviral therapy",
            "Maintain regular medical checkups",
            "Practice safe behaviors"
        ],
        "severity": "severe",
        "see_doctor": "Immediately - requires specialized care"
    },
    "Diabetes": {
        "description": "A metabolic disease affecting blood sugar levels",
        "recommendations": [
            "Monitor blood sugar regularly",
            "Follow a balanced diet",
            "Exercise regularly",
            "Take medications as prescribed"
        ],
        "severity": "chronic",
        "see_doctor": "For regular monitoring and management"
    },
    "Gastroenteritis": {
        "description": "Inflammation of the stomach and intestines",
        "recommendations": [
            "Stay hydrated with clear fluids",
            "Rest adequately",
            "Eat bland foods when able",
            "Practice good hand hygiene"
        ],
        "severity": "mild to moderate",
        "see_doctor": "If symptoms last more than 3 days or you become dehydrated"
    },
    "Bronchial Asthma": {
        "description": "Chronic respiratory condition affecting airways",
        "recommendations": [
            "Use inhalers as prescribed",
            "Avoid triggers",
            "Keep rescue inhaler nearby",
            "Monitor breathing regularly"
        ],
        "severity": "chronic",
        "see_doctor": "For regular management and during attacks"
    },
    "Hypertension": {
        "description": "High blood pressure",
        "recommendations": [
            "Reduce salt intake",
            "Exercise regularly",
            "Maintain healthy weight",
            "Monitor blood pressure at home"
        ],
        "severity": "chronic",
        "see_doctor": "For regular monitoring and medication adjustment"
    },
    "Migraine": {
        "description": "Severe recurrent headaches",
        "recommendations": [
            "Identify and avoid triggers",
            "Rest in a dark, quiet room",
            "Stay hydrated",
            "Consider preventive medications"
        ],
        "severity": "moderate",
        "see_doctor": "If migraines become more frequent or severe"
    },
    "Common Cold": {
        "description": "Viral infection of the upper respiratory tract",
        "recommendations": [
            "Rest and stay hydrated",
            "Use over-the-counter cold remedies",
            "Gargle with warm salt water",
            "Use a humidifier"
        ],
        "severity": "mild",
        "see_doctor": "If symptoms last more than 10 days"
    },
    "Pneumonia": {
        "description": "Infection that inflames air sacs in the lungs",
        "recommendations": [
            "Seek medical treatment promptly",
            "Complete full course of antibiotics",
            "Rest and stay hydrated",
            "Use a humidifier"
        ],
        "severity": "moderate to severe",
        "see_doctor": "Immediately - requires medical treatment"
    },
    "Typhoid": {
        "description": "Bacterial infection from contaminated food/water",
        "recommendations": [
            "Seek immediate medical care",
            "Complete antibiotic course",
            "Stay hydrated",
            "Practice good hygiene"
        ],
        "severity": "severe",
        "see_doctor": "Immediately - requires antibiotic treatment"
    },
    "Malaria": {
        "description": "Mosquito-borne infectious disease",
        "recommendations": [
            "Seek immediate medical treatment",
            "Complete antimalarial medication",
            "Rest and stay hydrated",
            "Use mosquito prevention methods"
        ],
        "severity": "severe",
        "see_doctor": "Immediately - requires urgent treatment"
    },
    "Jaundice": {
        "description": "Yellowing of skin due to liver issues",
        "recommendations": [
            "Seek medical evaluation",
            "Rest adequately",
            "Stay hydrated",
            "Avoid alcohol and fatty foods"
        ],
        "severity": "moderate to severe",
        "see_doctor": "Immediately to identify underlying cause"
    },
    "Heart attack": {
        "description": "Blocked blood flow to heart muscle",
        "recommendations": [
            "CALL EMERGENCY SERVICES IMMEDIATELY",
            "Chew aspirin if not allergic",
            "Stay calm and rest",
            "Do not drive yourself"
        ],
        "severity": "emergency",
        "see_doctor": "CALL EMERGENCY IMMEDIATELY"
    }
}

def load_model():
    """Load the trained model and metadata"""
    global model, metadata
    
    model_path = os.path.join(MODEL_DIR, 'disease_predictor.pkl')
    metadata_path = os.path.join(MODEL_DIR, 'metadata.pkl')
    
    if os.path.exists(model_path) and os.path.exists(metadata_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        with open(metadata_path, 'rb') as f:
            metadata = pickle.load(f)
        print("Model loaded successfully!")
        return True
    else:
        print("Warning: Model not found. Please run final_code.py to train the model first.")
        return False

def extract_symptoms_from_text(text):
    """Extract symptoms from natural language text"""
    if metadata is None:
        return []
    
    symptoms_list = metadata['symptoms']
    text_lower = text.lower()
    
    # Clean and normalize text
    text_clean = re.sub(r'[^\w\s]', ' ', text_lower)
    text_words = set(text_clean.split())
    
    found_symptoms = []
    
    # Common symptom aliases
    symptom_aliases = {
        'itching': ['itch', 'itchy', 'itches', 'scratchy'],
        'skin_rash': ['rash', 'rashes', 'skin rash', 'red spots'],
        'headache': ['head pain', 'head ache', 'migraine'],
        'fever': ['temperature', 'feverish', 'high fever'],
        'cough': ['coughing', 'coughs'],
        'fatigue': ['tired', 'tiredness', 'exhausted', 'weakness', 'weak'],
        'vomiting': ['vomit', 'throwing up', 'nausea'],
        'nausea': ['nauseous', 'sick feeling', 'queasy'],
        'stomach_pain': ['stomachache', 'stomach ache', 'belly pain', 'abdominal pain'],
        'joint_pain': ['joint ache', 'joints hurt', 'arthritis'],
        'muscle_pain': ['muscle ache', 'body pain', 'sore muscles'],
        'chest_pain': ['chest hurts', 'chest ache'],
        'breathlessness': ['shortness of breath', 'cant breathe', 'difficulty breathing', 'breathing problem'],
        'high_fever': ['very hot', 'burning up', 'high temperature'],
        'sweating': ['sweat', 'sweaty', 'perspiring'],
        'chills': ['chilly', 'shivering', 'cold'],
        'dizziness': ['dizzy', 'lightheaded', 'vertigo'],
        'back_pain': ['backache', 'back ache'],
        'weight_loss': ['losing weight', 'lost weight'],
        'anxiety': ['anxious', 'worried', 'nervous'],
        'depression': ['depressed', 'sad', 'down'],
        'loss_of_appetite': ['not hungry', 'no appetite', 'cant eat'],
        'constipation': ['constipated', 'cant poop'],
        'diarrhoea': ['diarrhea', 'loose motion', 'loose stool'],
        'acidity': ['acid reflux', 'heartburn', 'acidic'],
        'nodal_skin_eruptions': ['skin eruption', 'bumps', 'nodules'],
        'continuous_sneezing': ['sneezing', 'sneeze'],
        'shivering': ['shiver', 'trembling'],
        'cold_hands_and_feets': ['cold hands', 'cold feet', 'cold extremities'],
        'restlessness': ['restless', 'cant sleep', 'agitated'],
        'lethargy': ['sluggish', 'no energy', 'lethargic'],
        'yellowish_skin': ['yellow skin', 'jaundice'],
        'dark_urine': ['dark pee', 'brown urine'],
        'abdominal_pain': ['stomach pain', 'belly ache', 'tummy pain'],
        'runny_nose': ['running nose', 'nasal drip'],
        'congestion': ['congested', 'blocked nose', 'stuffy nose'],
        'sore_throat': ['throat pain', 'throat hurts'],
        'red_spots_over_body': ['red spots', 'spots on body', 'rash'],
    }
    
    for symptom in symptoms_list:
        # Convert symptom name to searchable pattern
        symptom_pattern = symptom.replace('_', ' ')
        
        # Check if exact symptom pattern appears in text
        if symptom_pattern in text_clean:
            found_symptoms.append(symptom)
            continue
        
        # Check individual words for multi-word symptoms
        symptom_words = symptom.split('_')
        if len(symptom_words) == 1 and symptom_words[0] in text_words:
            found_symptoms.append(symptom)
            continue
        
        # Check aliases
        if symptom in symptom_aliases:
            for alias in symptom_aliases[symptom]:
                if alias in text_clean:
                    found_symptoms.append(symptom)
                    break
    
    return list(set(found_symptoms))

def predict_disease(symptoms_input):
    """
    Predict disease based on symptoms
    """
    global model, metadata
    
    if model is None or metadata is None:
        return None
    
    symptoms = metadata['symptoms']
    
    # Create feature vector
    feature_vector = np.zeros(len(symptoms))
    
    matched_symptoms = []
    for symptom in symptoms_input:
        symptom_clean = symptom.lower().strip().replace(' ', '_')
        if symptom_clean in symptoms:
            idx = symptoms.index(symptom_clean)
            feature_vector[idx] = 1
            matched_symptoms.append(symptom_clean)
    
    if sum(feature_vector) == 0:
        return None
    
    # Make prediction
    feature_vector = feature_vector.reshape(1, -1)
    prediction = model.predict(feature_vector)[0]
    
    # Get probability if available
    confidence = None
    top_predictions = []
    
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(feature_vector)[0]
        confidence = float(max(proba))
        
        # Get top 3 predictions
        classes = model.classes_
        top_indices = np.argsort(proba)[::-1][:3]
        top_predictions = [
            {"disease": classes[i], "probability": float(proba[i])}
            for i in top_indices if proba[i] > 0.01
        ]
    
    # Get disease info
    disease_info = DISEASE_INFO.get(prediction.strip(), {
        "description": "Please consult a healthcare professional for more information.",
        "recommendations": ["Consult a doctor for proper diagnosis"],
        "severity": "unknown",
        "see_doctor": "For proper diagnosis and treatment"
    })
    
    return {
        'disease': prediction.strip(),
        'confidence': confidence,
        'symptoms_matched': matched_symptoms,
        'top_predictions': top_predictions,
        'info': disease_info
    }

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Get list of all possible symptoms"""
    if metadata is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    symptoms = [s.replace('_', ' ').title() for s in metadata['symptoms']]
    return jsonify({'symptoms': symptoms})

@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    """Get list of all possible diseases"""
    if metadata is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({'diseases': metadata['diseases']})

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict disease from symptoms
    
    Expected JSON:
    {
        "symptoms": ["itching", "skin_rash", "headache"]
    }
    
    OR for natural language:
    {
        "message": "I have itching and skin rash"
    }
    """
    if model is None:
        return jsonify({'error': 'Model not loaded. Please train the model first.'}), 500
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    symptoms = []
    
    # Handle direct symptoms list
    if 'symptoms' in data:
        symptoms = data['symptoms']
    
    # Handle natural language message
    elif 'message' in data:
        symptoms = extract_symptoms_from_text(data['message'])
        if not symptoms:
            return jsonify({
                'error': 'Could not identify symptoms from your message',
                'suggestion': 'Please describe your symptoms more clearly, such as: headache, fever, cough, etc.'
            }), 400
    
    else:
        return jsonify({'error': 'Please provide symptoms or a message'}), 400
    
    # Make prediction
    result = predict_disease(symptoms)
    
    if result is None:
        return jsonify({
            'error': 'Could not make prediction',
            'suggestion': 'Please provide valid symptoms'
        }), 400
    
    return jsonify(result)

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chatbot endpoint for conversational interaction
    
    Expected JSON:
    {
        "message": "I have headache and fever"
    }
    """
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({
            'response': "Hi! I'm your health assistant. Please tell me about your symptoms and I'll help identify possible conditions.",
            'type': 'greeting'
        })
    
    message = data['message'].lower()
    message_words = set(message.split())
    
    # Handle greetings - only if they appear as standalone words at the start
    greeting_words = ['hello', 'hey']
    if any(word in message_words and message.strip().startswith(word) for word in greeting_words):
        return jsonify({
            'response': "Hello! I'm here to help you understand your symptoms. Please describe what you're experiencing, and I'll suggest possible conditions. Remember, this is not a substitute for professional medical advice.",
            'type': 'greeting'
        })
    
    # Handle "hi" specifically - only at the start
    if message.strip().startswith('hi ') or message.strip() == 'hi':
        return jsonify({
            'response': "Hello! I'm here to help you understand your symptoms. Please describe what you're experiencing, and I'll suggest possible conditions. Remember, this is not a substitute for professional medical advice.",
            'type': 'greeting'
        })
    
    # Handle help requests
    if message.strip() == 'help' or message.strip().startswith('help me'):
        return jsonify({
            'response': "Hello! I'm here to help you understand your symptoms. Please describe what you're experiencing, and I'll suggest possible conditions. Remember, this is not a substitute for professional medical advice.",
            'type': 'greeting'
        })
    
    # Handle thank you
    if any(word in message_words for word in ['thank', 'thanks', 'bye', 'goodbye']):
        return jsonify({
            'response': "You're welcome! Take care and don't hesitate to consult a healthcare professional. Stay healthy!",
            'type': 'farewell'
        })
    
    # Try to extract symptoms and predict
    if model is None:
        return jsonify({
            'response': "I apologize, but my diagnostic model is not ready yet. Please try again later.",
            'type': 'error'
        })
    
    symptoms = extract_symptoms_from_text(message)
    
    if not symptoms:
        return jsonify({
            'response': "I couldn't identify specific symptoms from your message. Could you please describe your symptoms more clearly? For example: 'I have a headache, fever, and cough'",
            'type': 'clarification',
            'available_symptoms': [s.replace('_', ' ') for s in metadata['symptoms'][:20]]
        })
    
    result = predict_disease(symptoms)
    
    if result is None:
        return jsonify({
            'response': "I couldn't analyze those symptoms. Please try describing them differently.",
            'type': 'error'
        })
    
    # Build response
    confidence_text = ""
    if result['confidence']:
        conf_pct = result['confidence'] * 100
        if conf_pct > 80:
            confidence_text = "I'm fairly confident that"
        elif conf_pct > 50:
            confidence_text = "Based on your symptoms, it's possible that"
        else:
            confidence_text = "This is uncertain, but"
    
    info = result['info']
    
    response = f"{confidence_text} you may have **{result['disease']}**.\n\n"
    response += f"**Description:** {info['description']}\n\n"
    response += f"**Severity:** {info['severity']}\n\n"
    response += "**Recommendations:**\n"
    for rec in info['recommendations']:
        response += f"• {rec}\n"
    response += f"\n**When to see a doctor:** {info['see_doctor']}\n\n"
    response += "⚠️ *This is not a medical diagnosis. Please consult a healthcare professional for proper evaluation.*"
    
    return jsonify({
        'response': response,
        'type': 'diagnosis',
        'prediction': result
    })

if __name__ == '__main__':
    print("=" * 50)
    print("Disease Prediction Chatbot API")
    print("=" * 50)
    
    # Load the model
    if not load_model():
        print("\nTo train the model, run: python final_code.py")
    
    # Start the server
    print("\nStarting server on http://localhost:5000")
    print("\nEndpoints:")
    print("  GET  /api/health    - Health check")
    print("  GET  /api/symptoms  - List all symptoms")
    print("  GET  /api/diseases  - List all diseases")
    print("  POST /api/predict   - Predict disease from symptoms")
    print("  POST /api/chat      - Chatbot conversation")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
