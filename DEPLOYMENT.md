# RuralMed AI - Deployment Guide

## Project Structure

```
prototype2/
├── api/                    # Vercel serverless functions
│   ├── activities.js
│   ├── health-records.js
│   ├── chat.js
│   └── stats.js
├── ml/                     # Python ML model (deploy separately)
│   ├── final_code.py       # Training script
│   ├── job.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── models/             # Trained model files
├── pages/                  # HTML pages
├── css/                    # Stylesheets
├── js/                     # JavaScript
├── vercel.json             # Vercel configuration
└── package.json
```

## Deployment Steps

### 1. Deploy Frontend + API to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd prototype2
vercel

# For production
vercel --prod
```

### 2. Deploy ML API to Railway (Recommended)

The ML model is too large for Vercel's serverless functions. Deploy it to Railway:

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repo or upload the `ml/` folder
4. Set the start command: `python job.py`
5. Railway will auto-detect Python and install requirements

**Or use Render:**

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect repo, select `ml/` as root directory
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python job.py`

### 3. Configure Environment Variables

In Vercel, add:
- `ML_API_URL`: Your Railway/Render ML API URL (e.g., `https://your-ml-api.railway.app`)

### 4. Update API URL in Code

After deploying ML API, update [js/app.js](js/app.js):

```javascript
const ML_CHATBOT = {
    baseUrl: 'https://your-ml-api.railway.app',  // Update this
    enabled: true
};
```

## Local Development

```bash
# Start Node.js server
npm start

# Start ML API (in separate terminal)
cd ml
python job.py
```

## API Endpoints

### Vercel APIs (Frontend)
- `POST /api/activities` - Log activity
- `GET /api/activities` - Get activities
- `GET /api/stats` - Get statistics
- `POST /api/health-records` - Add health record
- `GET /api/health-records` - Get health records
- `POST /api/chat` - Chat with AI (proxies to ML API)

### ML API (Railway/Render)
- `GET /api/health` - Health check
- `GET /api/symptoms` - List all symptoms
- `GET /api/diseases` - List all diseases
- `POST /api/predict` - Predict disease from symptoms
- `POST /api/chat` - Chatbot conversation

## Notes

- Vercel has a read-only filesystem, so activity/health data uses client-side localStorage
- For persistent server-side data, consider Vercel Postgres or Upstash Redis
- The ML model files (~10MB) are stored in `ml/models/`
