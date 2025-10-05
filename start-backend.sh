#!/bin/bash

# Start CivicScribe Backend Server

echo "🚀 Starting CivicScribe Backend..."
echo "==================================="
echo ""

cd backend

if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Starting FastAPI server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 main.py
