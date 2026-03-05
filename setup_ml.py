#!/usr/bin/env python
"""
ML Environment Setup Script
Installs and verifies all dependencies for the ML system
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python packages from requirements.txt"""
    req_file = os.path.join(os.path.dirname(__file__), 'ml', 'requirements.txt')
    
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
        print("✓ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False

def train_model():
    """Train the ML model if not already trained"""
    model_file = os.path.join(os.path.dirname(__file__), 'ml', 'models', 'disease_predictor.pkl')
    
    if os.path.exists(model_file):
        print("✓ Model already trained")
        return True
    
    print("\nTraining ML model... (this may take a few minutes)")
    try:
        subprocess.check_call([sys.executable, os.path.join(os.path.dirname(__file__), 'ml', 'final_code.py')])
        print("✓ Model trained successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to train model: {e}")
        return False

def main():
    """Run all setup tasks"""
    print("=" * 60)
    print("ML Environment Setup")
    print("=" * 60)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Train model
    if not train_model():
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print("\nYou can now start the API with:")
    print("  python ml/start_api.py")
    print("\nOr use the batch script:")
    print("  start_ml_api.bat")

if __name__ == '__main__':
    main()
