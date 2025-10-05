#!/bin/bash

# Start CivicScribe Frontend Server

echo "🚀 Starting CivicScribe Frontend..."
echo "===================================="
echo ""

cd frontend

if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not found. Please run ./setup.sh first."
    exit 1
fi

echo "Starting Vite dev server on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
