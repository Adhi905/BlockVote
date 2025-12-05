#!/bin/bash
# deploy-mobile.sh - Automate Mobile Deployment for BlockVote

echo "🚀 Starting BlockVote Mobile Deployment..."
echo "📱 This script will start your backend/frontend and expose them via localtunnel."

# Check for localtunnel
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not installed. Please install Node.js."
    exit 1
fi

cleanup() {
    echo -e "\n🛑 Stopping servers and tunnels..."
    # Kill all child processes of this script
    pkill -P $$
    exit 0
}
trap cleanup INT TERM

# Function to wait for URL
get_tunnel_url() {
    local log_file=$1
    local retries=0
    local max_retries=30 # 30 * 2s = 60s max wait
    
    while [ $retries -lt $max_retries ]; do
        # Look for the URL line
        url=$(grep -o 'https://[^ ]*loca.lt' "$log_file" | head -n 1)
        if [ ! -z "$url" ]; then
            echo "$url"
            return 0
        fi
        sleep 2
        retries=$((retries+1))
        echo -n "." >&2
    done
    return 1
}

# 1. Start Backend
echo "🔧 Starting Backend (Port 6001)..."
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 5

# 2. Tunnel Backend
echo -n "🌐 Creating Backend Tunnel (this might take a minute).."
rm -f backend_tunnel.log
# Use -y to auto-confirm installation if needed
npx -y localtunnel --port 6001 > backend_tunnel.log 2>&1 &
BT_PID=$!

BACKEND_URL=$(get_tunnel_url "backend_tunnel.log")

if [ -z "$BACKEND_URL" ]; then
    echo ""
    echo "❌ Failed to get Backend Tunnel URL. Viewing logs:"
    cat backend_tunnel.log
    cleanup
fi

echo ""
echo "✅ Backend Live at: $BACKEND_URL"

# 3. Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
# Pass the backend URL to Vite app
VITE_API_URL=$BACKEND_URL npm run dev -- --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for Vite to start and grab port
echo -n "⏳ Waiting for Frontend to start details.."
FRONTEND_PORT=""
retries=0
while [ -z "$FRONTEND_PORT" ] && [ $retries -lt 30 ]; do
    if [ -f frontend.log ]; then
        # Extract port from "Local:   http://localhost:8080/"
        # We look for the line containing "Local:" and extract the port number
        FRONTEND_PORT=$(grep "Local:" frontend.log | grep -o ':[0-9]\+/' | grep -o '[0-9]\+')
    fi
    sleep 1
    retries=$((retries+1))
    echo -n "." >&2
done

if [ -z "$FRONTEND_PORT" ]; then
    echo ""
    echo "❌ Failed to detect Frontend Port. Viewing logs:"
    cat frontend.log
    cleanup
fi

echo ""
echo "✅ Frontend running on port: $FRONTEND_PORT"

# 4. Tunnel Frontend
echo -n "🌐 Creating Frontend Tunnel (Port $FRONTEND_PORT).."
rm -f frontend_tunnel.log
npx -y localtunnel --port $FRONTEND_PORT > frontend_tunnel.log 2>&1 &
FT_PID=$!

FRONTEND_URL=$(get_tunnel_url "frontend_tunnel.log")

if [ -z "$FRONTEND_URL" ]; then
    echo ""
    echo "❌ Failed to get Frontend Tunnel URL. Viewing logs:"
    cat frontend_tunnel.log
    echo "⚠️  Frontend Tunnel might be running but URL not captured."
else
    echo ""
    echo "✅ Frontend Live at: $FRONTEND_URL"
fi

# Get Public IP for Tunnel Password
echo -n "🔍 Fetching Tunnel Password (Public IP)..."
PUBLIC_IP=$(curl -s ipv4.icanhazip.com)
echo " $PUBLIC_IP"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "---------------------------------------------------"
echo "1. On your Mobile (Metamask App Browser), go to:"
echo "   👉 $FRONTEND_URL"
echo ""
echo "2. If asked for a Tunnel Password, enter:"
echo "   👉 $PUBLIC_IP"
echo ""
echo "3. Connect your Wallet (Sepolia Network) and Vote!"
echo "---------------------------------------------------"
echo "4. Keep this terminal open!"
echo "   Press Ctrl+C to stop everything."

# Keep script running
wait
