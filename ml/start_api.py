#!/usr/bin/env python
"""
ML API Startup Script
Starts the Disease Prediction Chatbot API on port 5000
"""

import os
import sys
import subprocess

# Change to the ml directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Check if the required packages are installed
try:
    import flask
    import flask_cors
except ImportError:
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "flask", "flask-cors"])

# Start the API
print("=" * 50)
print("Starting Disease Prediction API...")
print("=" * 50)
print("\nAPI will be available at: http://localhost:5000")
print("\nEndpoints:")
print("  GET  /api/health    - Health check")
print("  GET  /api/symptoms  - List all symptoms")
print("  GET  /api/diseases  - List all diseases")
print("  POST /api/predict   - Predict disease from symptoms")
print("  POST /api/chat      - Chatbot conversation")
print("\nPress Ctrl+C to stop the server")
print("=" * 50)

# Import and run the Flask app
from job import app

try:
    app.run(host='0.0.0.0', port=5000, debug=False)
except KeyboardInterrupt:
    print("\n\nServer stopped.")
    sys.exit(0)
