# ML Models & Chatbot Integration Guide

## Overview

This project includes a trained machine learning disease prediction model that's integrated with the chatbot. The system can predict diseases based on symptoms using a RandomForest classifier with 98% test accuracy.

## Model Training

### Model Details
- **Algorithm**: RandomForest Classifier (100 estimators)
- **Training Accuracy**: 100% (cross-validation)
- **Test Accuracy**: 97.62%
- **Symptoms**: 132 different symptoms
- **Diseases**: 41 different diseases
- **Training Samples**: 4,920 samples

### Trained Model Files
- `ml/models/disease_predictor.pkl` - Trained model (RandomForest)
- `ml/models/metadata.pkl` - Symptoms and diseases metadata

## Quick Start

### 1. Install Dependencies

```bash
cd <project-root>
python -m pip install -r ml/requirements.txt
```

Or use the setup script:
```bash
python setup_ml.py
```

### 2. Start the ML API

#### Option A: Using Python
```bash
python ml/start_api.py
```

#### Option B: Using Batch Script (Windows)
```bash
start_ml_api.bat
```

#### Option C: Direct Flask
```bash
cd ml
python job.py
```

The API will start on `http://localhost:5000`

### 3. Verify API is Running

Check health status:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
    "status": "healthy",
    "model_loaded": true
}
```

### 4. Use the Chatbot

Once the API is running, the web application will automatically use the ML model for symptom analysis.

Visit: `http://localhost:3000` (or wherever your web server is running)

## API Endpoints

### GET /api/health
Health check endpoint
```bash
curl http://localhost:5000/api/health
```

### GET /api/symptoms
Get list of all available symptoms
```bash
curl http://localhost:5000/api/symptoms
```

### GET /api/diseases
Get list of all possible diseases
```bash
curl http://localhost:5000/api/diseases
```

### POST /api/predict
Predict disease from symptoms (direct symptoms list)
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["itching", "skin_rash", "headache"]}'
```

OR with natural language:
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"message": "I have itching and skin rash"}'
```

### POST /api/chat
Conversational chatbot endpoint
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a headache and fever"}'
```

## Response Format

### Successful Prediction Response
```json
{
    "disease": "Fungal infection",
    "confidence": 1.0,
    "symptoms_matched": ["itching", "skin_rash", "nodal_skin_eruptions"],
    "top_predictions": [
        {
            "disease": "Fungal infection",
            "probability": 1.0
        },
        {
            "disease": "Allergy",
            "probability": 0.05
        }
    ],
    "info": {
        "description": "A skin infection caused by fungi",
        "recommendations": [
            "Keep the affected area clean and dry",
            "Use antifungal creams as prescribed",
            "Avoid sharing personal items",
            "Wear loose, breathable clothing"
        ],
        "severity": "mild",
        "see_doctor": "If symptoms persist for more than 2 weeks"
    }
}
```

### Chat Response
```json
{
    "response": "Based on your symptoms, it's possible that you may have **Fungal infection**...",
    "type": "diagnosis",
    "prediction": {
        "disease": "Fungal infection",
        "confidence": 1.0,
        "symptoms_matched": ["itching", "skin_rash"],
        ...
    }
}
```

## Retraining the Model

To retrain the model with updated data:

1. **Update training data** in `data/training/`:
   - `Training.csv.xls`
   - `Testing.csv.xls`

2. **Run training script**:
```bash
python ml/final_code.py
```

3. **Restart the API**:
```bash
# Stop the running API (Ctrl+C)
# Then restart it
python ml/start_api.py
```

## Architecture

```
┌─────────────────────┐
│   Web Frontend      │
│  (HTML/JS/CSS)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Node.js Server    │
│  (server.js)        │
│  - Chat API         │
│  - Vercel APIs      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Flask ML API      │
│   (job.py)          │
│  - Disease Predict  │
│  - Symptom Extract  │
│  - Chat Logic       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ML Model          │
│  - RandomForest     │
│  - 132 symptoms     │
│  - 41 diseases      │
└─────────────────────┘
```

## Configuration

### Environment Variables

For production deployment:

```bash
# Flask API
export PORT=5000
export ML_API_URL=http://localhost:5000

# Frontend
export ML_CHATBOT_URL=http://localhost:5000
```

### Windows Batch Configuration

The `start_ml_api.bat` script automatically configures the environment and starts the API.

## Troubleshooting

### API won't start
```bash
# Check Python installation
python --version

# Check dependencies
pip install -r ml/requirements.txt

# Check if port 5000 is in use
netstat -ano | findstr :5000
```

### Model not loading
```bash
# Verify model files exist
dir ml\models\

# Retrain the model
python ml/final_code.py
```

### Chatbot not using ML model
1. Verify API is running: `http://localhost:5000/api/health`
2. Check browser console for errors
3. Ensure `ml/start_api.py` is running
4. Check that `ML_CHATBOT.baseUrl` is correctly set in `js/app.js`

### Low prediction accuracy
- Ensure model is properly trained: `python ml/final_code.py`
- Check training data is complete and correct
- Verify all required columns in CSV files

## Performance Notes

- **Model Loading**: ~0.5 seconds (first time)
- **Prediction Time**: ~50-100ms per request
- **RAM Usage**: ~200MB
- **Concurrent Users**: Supports multiple concurrent requests

## Security Considerations

1. **Disclaimer**: The model is NOT a replacement for professional medical advice
2. **CORS**: Currently allows all origins - restrict in production
3. **Input Validation**: Symptoms are validated against known symptoms list
4. **Rate Limiting**: Implement in production
5. **HTTPS**: Use HTTPS in production

## Files Structure

```
ml/
├── final_code.py           # Model training script
├── job.py                  # Flask API server
├── start_api.py            # API startup helper
├── requirements.txt        # Python dependencies
├── models/
│   ├── disease_predictor.pkl  # Trained model
│   └── metadata.pkl           # Metadata (symptoms, diseases)
├── data/
│   └── training/
│       ├── Training.csv.xls
│       ├── Testing.csv.xls
│       └── patient_lifestyle_data.csv.xls
└── [other training scripts]
```

## Support

For issues or questions:
1. Check logs in the terminal where the API is running
2. Verify all dependencies are installed
3. Ensure training data files exist
4. Check network connectivity between frontend and API

---

**Last Updated**: March 5, 2026
**Model Version**: 1.0 (RandomForest)
**API Version**: 1.0
