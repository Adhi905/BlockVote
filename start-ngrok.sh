#!/bin/bash
# Quick script to start ngrok tunnels for BlockVote

echo "🚀 Starting ngrok tunnels for BlockVote..."
echo ""
echo "Make sure your services are running:"
echo "  - Backend: PORT=6001 node index.js (in blockvote-backend/)"
echo "  - Frontend: python3 -m http.server 5502 (in blockvote-frontend/frontend/web3/)"
echo ""
echo "Press Ctrl+C to stop all tunnels"
echo ""

# Start backend tunnel
echo "📡 Starting backend tunnel (port 6001)..."
ngrok http 6001 &
BACKEND_PID=$!

# Wait a moment
sleep 2

# Start frontend tunnel
echo "🌐 Starting frontend tunnel (port 5502)..."
ngrok http 5502 &
FRONTEND_PID=$!

echo ""
echo "✅ Tunnels started!"
echo ""
echo "📋 Your ngrok URLs:"
echo "   - Check http://localhost:4040 for backend tunnel URL"
echo "   - Check http://localhost:4041 for frontend tunnel URL"
echo ""
echo "   Or run: ps aux | grep ngrok"
echo ""
echo "💡 To stop: killall ngrok"
echo ""
echo "Press Ctrl+C to stop..."

# Wait for user interrupt
wait

