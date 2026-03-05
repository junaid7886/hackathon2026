# 🏗️ Complete System Architecture

## High-Level Overview

```
USER INTERFACE
├── Web Browser
├── HTML Pages (dashboard, chat, profile, etc.)
├── JavaScript (app.js) - Updated to use ML API
└── Responsive Design

    ↓ (User sends message: "I have headache and fever")
    
BACKEND SERVER
├── Node.js (server.js)
├── Vercel API Routes (api/auth.js, api/activities.js, etc.)
└── Chat Proxy (api/chat.js)

    ↓ (Forwards to ML API)
    
ML PREDICTION ENGINE
├── Flask Server (job.py)
├── Port: 5000
├── REST API with 5 endpoints
└── Integrated with:
    ├── RandomForest Model (trained)
    ├── Symptom Extractor (natural language)
    ├── Disease Database (41 diseases)
    └── Disease Info (recommendations, severity, etc.)

    ↓ (Returns prediction)
    
RESPONSE
├── Predicted Disease with Confidence Score
├── Top 3 Alternative Predictions
├── Medical Recommendations
├── Severity Assessment
└── Doctor Consultation Guidance

    ↓ (Displays to user)
    
USER SEES RESULT ✅
```

---

## Detailed Component Breakdown

### 1️⃣ Frontend Layer (JavaScript)

**Location**: `js/app.js`, `pages/chat.html`

```javascript
ML_CHATBOT Configuration:
├── API URL: http://localhost:5000
├── Enabled: true
└── Functions:
    ├── mlChatbotPredict(message)  - Send message to ML
    ├── mlChatbotGetSymptoms()     - Fetch available symptoms
    └── sendMessage()              - Handle chat interaction
```

**User Workflow**:
1. User types symptom message in chat
2. `sendMessage()` captures text
3. Sends to `/api/chat` endpoint
4. Flask returns disease prediction
5. Response displays in chat interface

---

### 2️⃣ Backend Server Layer (Node.js)

**Location**: `server.js`, `api/chat.js`

```javascript
Chat API Handler:
├── Receives POST /api/chat
├── Forwards to 'http://localhost:5000/api/chat'
├── Handles CORS
├── Fallback logic if ML API unavailable
└── Returns JSON response to frontend
```

**Key Features**:
- Proxies requests to ML API
- Enables cross-origin requests
- Provides fallback responses
- Handles errors gracefully

---

### 3️⃣ ML Prediction Layer (Flask - Python)

**Location**: `ml/job.py` (Port: 5000)

```
Flask Application:
├── Model Loader
│   ├── Loads RandomForest model
│   ├── Loads metadata (symptoms, diseases)
│   └── Initializes on startup
│
├── Symptom Extractor
│   ├── Parses natural language
│   ├── Matches against 132 symptoms
│   ├── Uses symptom aliases
│   └── Returns matched symptoms
│
├── Disease Predictor
│   ├── Takes matched symptoms
│   ├── Runs RandomForest classification
│   ├── Gets probabilities
│   └── Returns top 3 predictions
│
├── Response Builder
│   ├── Adds disease information
│   ├── Includes recommendations
│   ├── Assesses severity
│   └── Formats response
│
└── API Routes
    ├── GET /api/health
    ├── GET /api/symptoms
    ├── GET /api/diseases
    ├── POST /api/predict
    └── POST /api/chat
```

---

### 4️⃣ ML Model Layer

**Location**: `ml/models/disease_predictor.pkl`

```
RandomForest Classifier:
├── Algorithm: RandomForest (100 trees)
├── Input Features: 132 symptoms (binary)
├── Output Classes: 41 diseases
├── Trained on: 4,920 samples
├── Accuracy: 97.62% (test set)
│
├── Training Process:
│   ├── Load CSV data
│   ├── Clean & normalize
│   ├── Create feature vectors
│   ├── Train-test split
│   ├── Cross-validation
│   ├── Fit RandomForest
│   └── Save model
│
└── Prediction Process:
    ├── Create symptom feature vector
    ├── Feed to trained model
    ├── Get probability scores
    ├── Return top 3 predictions
    └── Include confidence levels
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     END USER (Browser)                       │
│                  "I have headache and fever"                │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               app.js → mlChatbotPredict()                   │
│            Sends to: http://localhost:5000/api/chat         │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           API Proxy (api/chat.js - Node.js)                 │
│       Forwards request, enables CORS, handles errors        │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Flask API (job.py) - Port 5000                      │
│                                                              │
│  1. extract_symptoms_from_text("I have headache and fever") │
│     → ["headache", "fever", "high_fever"]                   │
│                                                              │
│  2. predict_disease(["headache", "fever", "high_fever"])   │
│     → Call trained model                                    │
│     → Get probabilities                                     │
│     → Top 3: Cold (45%), Flu (35%), Migraine (20%)         │
│                                                              │
│  3. Get disease info from DISEASE_INFO dict                 │
│     → Description, recommendations, severity               │
│                                                              │
│  4. Build response message with formatting                  │
│     → Confidence levels, recommendations, warning           │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    JSON Response:                            │
│  {                                                           │
│    "response": "Based on your symptoms...",                │
│    "type": "diagnosis",                                     │
│    "prediction": {                                          │
│      "disease": "Common Cold",                             │
│      "confidence": 0.45,                                    │
│      "symptoms_matched": ["headache", "fever"],            │
│      "top_predictions": [                                  │
│        {"disease": "Common Cold", "probability": 0.45},   │
│        {"disease": "Flu", "probability": 0.35},           │
│        {"disease": "Migraine", "probability": 0.20}       │
│      ],                                                     │
│      "info": {                                             │
│        "description": "...",                               │
│        "recommendations": [...],                          │
│        "severity": "mild",                                │
│        "see_doctor": "If symptoms persist..."             │
│      }                                                      │
│    }                                                        │
│  }                                                          │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Response → Browser → JavaScript                   │
│           Format and display results to user                │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   DISPLAY IN CHAT:                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Bot: Based on your symptoms, it's possible that you   │ │
│  │ may have **Common Cold** (45% confidence)             │ │
│  │                                                        │ │
│  │ **Description:** Viral infection...                   │ │
│  │ **Severity:** Mild                                    │ │
│  │ **Recommendations:**                                  │ │
│  │ • Rest and stay hydrated                             │ │
│  │ • Use over-the-counter cold remedies                 │ │
│  │ • ...                                                 │ │
│  │                                                        │ │
│  │ ⚠️ Disclaimer: Not a medical diagnosis...             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
project/
│
├── 🎨 Frontend
│   ├── index.html
│   ├── project.html
│   ├── pages/
│   │   ├── chat.html          ← Chatbot UI
│   │   ├── dashboard.html
│   │   ├── health-records.html
│   │   └── ...
│   ├── css/
│   │   └── styles.css
│   └── js/
│        └── app.js            ← Updated: ML API integration
│
├── 🖥️ Backend (Node.js)
│   ├── server.js               ← Main server
│   └── api/
│       ├── chat.js             ← Chat API handler
│       ├── auth.js
│       ├── activities.js
│       └── ...
│
├── 🤖 ML System
│   ├── ml/
│   │   ├── job.py              ← Flask API (MAIN)
│   │   ├── final_code.py        ← Training script
│   │   ├── start_api.py         ← API launcher
│   │   ├── requirements.txt     ← Python dependencies
│   │   │
│   │   ├── models/
│   │   │   ├── disease_predictor.pkl  ← Trained model
│   │   │   └── metadata.pkl           ← Symptoms & diseases
│   │   │
│   │   └── data/
│   │       └── training/
│   │           ├── Training.csv.xls
│   │           ├── Testing.csv.xls
│   │           └── patient_lifestyle_data.csv.xls
│   │
│   ├── setup_ml.py             ← Setup automation
│   ├── start_ml_api.bat        ← Windows batch launcher
│   └── test_integration.py     ← Integration tester
│
├── 📚 Documentation
│   ├── ML_INTEGRATION.md       ← Technical docs
│   ├── CHATBOT_QUICKSTART.md   ← Quick start guide
│   └── IMPLEMENTATION_SUMMARY.md ← Architecture & status
│
├── 📦 Config Files
│   ├── package.json
│   ├── vercel.json
│   └── requirements.txt
│
└── 📄 Other
    ├── README.md
    └── DEPLOYMENT.md
```

---

## Integration Points

### 1. Frontend → Backend
- **Protocol**: HTTP REST
- **URL**: `/api/chat`
- **Method**: POST
- **Body**: `{ "message": "symptom description" }`

### 2. Backend → ML API
- **Protocol**: HTTP REST
- **URL**: `http://localhost:5000/api/chat`
- **Method**: POST
- **Body**: `{ "message": "symptom description" }`

### 3. ML API → Model
- **Protocol**: Python function calls
- **Components**: 
  - Symptom extraction
  - Feature vector creation
  - Model prediction
  - Response formatting

---

## Key Advantages of This Architecture

✅ **Separation of Concerns**
- Frontend, backend, and ML are independent
- Easy to maintain and update

✅ **Scalability**
- ML API can run on separate server
- Can load balance requests

✅ **Reusability**
- ML API can be used by other clients
- Easy to integrate with mobile apps

✅ **Robustness**
- Fallback logic if ML API unavailable
- Graceful error handling

✅ **Performance**
- Prediction takes ~100ms
- Parallel processing possible
- Caching available

---

## Deployment Considerations

### Local Development
```
ML API: http://localhost:5000
Frontend: http://localhost:3000
Backend: http://localhost:3000
```

### Production
```
ML API: https://ml-api.yourdomain.com
Frontend: https://yourdomain.com
Backend: https://yourdomain.com

Use environment variables:
export ML_API_URL="https://ml-api.yourdomain.com"
```

---

**Architecture Last Updated**: March 5, 2026
**Status**: ✅ Fully Operational
**Ready for**: Development & Testing
