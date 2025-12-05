#!/bin/bash
# Start ngrok tunnels with pooling enabled
# This allows both backend and frontend to share the same endpoint

echo "🚀 Starting ngrok tunnels with pooling enabled..."
echo ""
echo "This will create one shared endpoint for both services"
echo ""

# Start backend tunnel with pooling
echo "📡 Starting backend tunnel (port 6001) with pooling..."
ngrok http 6001 --pooling-enabled &
BACKEND_PID=$!

# Wait a moment
sleep 3

# Start frontend tunnel with pooling (same endpoint)
echo "🌐 Starting frontend tunnel (port 5502) with pooling..."
ngrok http 5502 --pooling-enabled &
FRONTEND_PID=$!

echo ""
echo "✅ Tunnels started with pooling!"
echo ""
echo "📋 Check your shared ngrok URL at: http://localhost:4040"
echo ""
echo "💡 Both services will use the same endpoint URL"
echo "   The ngrok dashboard will show which service handles each request"
echo ""
echo "Press Ctrl+C to stop all tunnels..."

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID


