#!/bin/bash

# CivicScribe Quick Setup Script
# This script sets up and starts both backend and frontend servers

set -e

echo "🚀 CivicScribe Setup Script"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the civic-scribe root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Python
echo "📋 Checking prerequisites..."
if command_exists python3; then
    echo "✅ Python3 found: $(python3 --version)"
else
    echo "❌ Python3 not found. Please install Python 3.9 or higher."
    exit 1
fi

# Check for Node.js
if command_exists node; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check for npm
if command_exists npm; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found. Please install npm."
    exit 1
fi

echo ""
echo "📦 Setting up backend..."
echo "------------------------"

# Backend setup
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo "✅ Backend setup complete!"
echo ""

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
echo "-------------------------"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo "✅ Frontend setup complete!"
echo ""

cd ..

echo "✅ Setup Complete!"
echo ""
echo "⚠️  IMPORTANT: Before starting the servers, make sure you have:"
echo "   1. Created the database schema in Supabase"
echo "   2. Verified the environment variables in backend/.env and frontend/.env.local"
echo ""
echo "To start the servers:"
echo "   1. Backend:  cd backend && source venv/bin/activate && python3 main.py"
echo "   2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use the provided start scripts:"
echo "   ./start-backend.sh  (in one terminal)"
echo "   ./start-frontend.sh (in another terminal)"
echo ""
