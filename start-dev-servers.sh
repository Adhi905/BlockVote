#!/bin/bash

# Script to start both BlockVote backend and frontend servers simultaneously
# This script will:
# 1. Start the backend server (Node.js/Express) on port 6001
# 2. Serve the frontend static files on port 5502
# 3. Provide URLs to access both services

echo "🚀 Starting BlockVote Development Servers..."
echo ""

# Function to clean up background processes on exit
cleanup() {
    echo -e "\n🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM to clean up
trap cleanup INT TERM

# Find available port for backend (starting from 6001)
BACKEND_PORT=6001
while lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
  BACKEND_PORT=$((BACKEND_PORT + 1))
done

# Start backend server
echo "🔧 Starting Backend Server on port $BACKEND_PORT..."
cd blockvote-backend
PORT=$BACKEND_PORT node src/index.js &
BACKEND_PID=$!
cd ..

# Find available port for frontend (starting from 5502)
FRONTEND_PORT=5502
while lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
  FRONTEND_PORT=$((FRONTEND_PORT + 1))
done

# Start frontend server
echo "🎨 Starting Frontend Server on port $FRONTEND_PORT..."
cd blockvote-frontend
python3 -m http.server $FRONTEND_PORT &
FRONTEND_PID=$!
cd ../../..

# Give servers a moment to start
sleep 3

echo ""
echo "🔗 Access your application:"
echo "   Backend API: http://localhost:$BACKEND_PORT/"
echo "   Frontend UI: http://localhost:$FRONTEND_PORT/"
echo ""
echo "ℹ️  Press Ctrl+C to stop both servers"
echo ""

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID