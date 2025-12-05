# How to Vote as a User

This guide explains how any user (not just the admin/owner) can vote in elections.

## Prerequisites

1. **Web3 Wallet**: Install Rabby Wallet or MetaMask browser extension
2. **Sepolia ETH**: Get some Sepolia testnet ETH for gas fees (free from faucets)
3. **Backend Account**: Register/login to the BlockVote backend

## Step-by-Step Voting Process

### 1. Register/Login to the System

1. Open the frontend application
2. Go to the **Authentication** section
3. Either:
   - **Register**: Create a new account (select "Register" tab)
     - Fill in: First Name, Last Name, Email, Password, Age, Phone, Address
     - Click "Register as Voter"
   - **Login**: Use existing credentials
     - Email: `voter@blockvote.com`
     - Password: `voter123`
     - Role: Select "Voter"
     - Click "Login"

### 2. Connect Your Wallet

1. After logging in, click **"Connect Wallet"** button
2. Your wallet (Rabby/MetaMask) will prompt you to:
   - Connect the wallet
   - Switch to Sepolia network (if not already on it)
3. Approve the connection
4. You should see your wallet address displayed in the user profile

### 3. Ensure You're on Sepolia Network

- **Network**: Sepolia Test Network
- **Chain ID**: 11155111
- The app will automatically prompt you to switch if you're on a different network

### 4. Get Sepolia ETH (if needed)

If your wallet doesn't have Sepolia ETH:
1. Get free Sepolia ETH from a faucet:
   - https://sepoliafaucet.com/
   - https://faucet.quicknode.com/ethereum/sepolia
   - https://www.alchemy.com/faucets/ethereum-sepolia
2. Send it to your wallet address
3. You only need a small amount (0.001-0.01 ETH is plenty)

### 5. View Available Elections

1. Scroll to the **Elections** section
2. You'll see all active elections with:
   - Election ID
   - Candidate names
   - Current vote counts
   - Vote buttons for each candidate

### 6. Cast Your Vote

1. Find the election you want to vote in
2. Review the candidates
3. Click the **"Vote"** button next to your chosen candidate
4. Your wallet will prompt you to:
   - Review the transaction
   - Confirm the gas fee
   - Sign the transaction
5. Click **"Sign"** or **"Confirm"** in your wallet
6. Wait for the transaction to be confirmed on-chain
7. You'll see a success message: "Vote recorded on-chain"
8. The vote counts will update automatically

## Important Notes

### Voting Restrictions

- **One Vote Per Election**: Each wallet address can only vote once per election
- **Election Must Be Active**: You cannot vote in ended elections
- **Network Requirement**: Must be on Sepolia network (Chain ID: 11155111)
- **Gas Fees**: You need Sepolia ETH to pay for the transaction (~0.0001-0.001 ETH)

### Troubleshooting

**"You already voted in this election"**
- Your wallet address has already cast a vote
- Each address can only vote once per election

**"Gas balance is not enough"**
- Your wallet doesn't have enough Sepolia ETH
- Get more from a faucet (see step 4)

**"Please switch to Sepolia network"**
- Your wallet is on a different network
- The app will prompt you to switch automatically
- Or manually switch in your wallet settings

**"Wallet connection failed"**
- Make sure your wallet extension is installed and unlocked
- Refresh the page and try again

**Transaction fails**
- Check you have enough Sepolia ETH
- Ensure you're on Sepolia network
- Try refreshing the page

## Testing with Multiple Users

To test voting with multiple users:

1. **Different Wallets**: Each user needs a different wallet address
   - Create multiple accounts in Rabby/MetaMask
   - Or use different browsers/devices

2. **Different Backend Accounts**: Each user should have their own login
   - Register separate accounts in the backend
   - Or use the demo voter account

3. **Each User Follows Steps 1-6**: Each user independently:
   - Logs in
   - Connects their wallet
   - Votes for their chosen candidate

## Example: Voting as a Second User

1. **User 2** opens the frontend
2. **User 2** registers a new account (or uses `voter@blockvote.com`)
3. **User 2** connects their wallet (different address than User 1)
4. **User 2** ensures they have Sepolia ETH
5. **User 2** clicks "Vote" for their candidate
6. **User 2** confirms the transaction in their wallet
7. Vote is recorded on-chain with User 2's wallet address

## Using on Different Devices

### Option 1: Same Network, Different Devices

**Setup:**
1. Ensure all devices are on the same local network (same Wi-Fi)
2. Find your computer's local IP address:
   - **Mac/Linux**: Run `ifconfig` or `ip addr` in terminal, look for `inet` (usually `192.168.x.x` or `10.0.x.x`)
   - **Windows**: Run `ipconfig` in CMD, look for `IPv4 Address`
3. Start the backend server (if not already running):
   ```bash
   cd blockvote-backend
   PORT=6001 node index.js
   ```
4. Start a local web server for the frontend:
   ```bash
   cd blockvote-frontend/frontend/web3
   # Using Python 3:
   python3 -m http.server 5502 --bind 0.0.0.0
   # OR using Node.js (if you have http-server):
   npx http-server -p 5502 -a 0.0.0.0
   ```

**Access from Other Devices:**
- On Device 2 (phone, tablet, another computer):
  - Open browser and go to: `http://YOUR_IP_ADDRESS:5502`
  - Example: `http://192.168.1.100:5502`
  - The frontend will automatically connect to the backend at `http://YOUR_IP_ADDRESS:6001`

**Important Notes:**
- Make sure firewall allows connections on ports 5502 (frontend) and 6001 (backend)
- All devices must be on the same Wi-Fi network
- Each device needs its own wallet (Rabby/MetaMask mobile app or browser extension)

### Option 2: Using ngrok (Easiest for External Access)

**Perfect for testing from any device, anywhere!**

ngrok creates secure tunnels to your local servers, making them accessible from the internet without deployment.

#### Step 1: Install ngrok

1. **Download ngrok:**
   - Visit: https://ngrok.com/download
   - Download for your OS (Mac, Windows, Linux)
   - Extract the executable

2. **Sign up for free account:**
   - Go to: https://dashboard.ngrok.com/signup
   - Create free account (no credit card needed)
   - Get your authtoken from dashboard

3. **Configure ngrok:**
   ```bash
   # Mac/Linux:
   ./ngrok authtoken YOUR_AUTH_TOKEN
   
   # Windows:
   ngrok.exe authtoken YOUR_AUTH_TOKEN
   ```

#### Step 2: Start Your Services

**Terminal 1 - Backend:**
```bash
cd blockvote-backend
PORT=6001 node index.js
```

**Terminal 2 - Frontend:**
```bash
cd blockvote-frontend/frontend/web3
python3 -m http.server 5502
# OR
npx http-server -p 5502
```

#### Step 3: Create ngrok Tunnels

**Terminal 3 - Backend Tunnel:**
```bash
ngrok http 6001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:6001
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

**Terminal 4 - Frontend Tunnel:**
```bash
ngrok http 5502
```

You'll see output like:
```
Forwarding  https://xyz789.ngrok-free.app -> http://localhost:5502
```

**Copy the HTTPS URL** (e.g., `https://xyz789.ngrok-free.app`)

#### Step 4: Update Frontend Configuration

The frontend needs to know the ngrok backend URL. You have two options:

**Option A: Update app.js (Temporary for Testing)**

Edit `blockvote-frontend/frontend/web3/app.js`:
```javascript
// Replace line 23 with your ngrok backend URL:
const BACKEND_ROOT = "https://abc123.ngrok-free.app"; // Your ngrok backend URL
```

**Option B: Use URL Parameter (Better - No Code Changes)**

Access frontend with backend URL parameter:
```
https://xyz789.ngrok-free.app?backend=https://abc123.ngrok-free.app
```

Then update `app.js` to read from URL:
```javascript
// Get backend URL from query parameter, fallback to default
const urlParams = new URLSearchParams(window.location.search);
const BACKEND_ROOT = urlParams.get('backend') || `http://${BACKEND_HOST}:${BACKEND_PORT}`;
```

#### Step 5: Access from Any Device

1. **On any device (phone, tablet, another computer):**
   - Open browser
   - Go to your **frontend ngrok URL**: `https://xyz789.ngrok-free.app`
   - If using Option B, add `?backend=https://abc123.ngrok-free.app`

2. **Use the app normally:**
   - Login/Register
   - Connect wallet
   - Vote

#### ngrok Tips

**Free Tier Limitations:**
- URLs change each time you restart ngrok (unless you have paid plan)
- Rate limits apply (but fine for testing)
- "Visit Site" button on ngrok page (click to bypass warning)

**Keeping URLs Stable:**
- Use ngrok's reserved domains (paid feature)
- Or use a script to update frontend automatically
- Or use environment variable for backend URL

**Security:**
- ngrok URLs are public - anyone with the URL can access
- Fine for testing, but don't use for production
- Consider password protection if needed

**Multiple Users:**
- All users access the same ngrok URLs
- Each user needs their own wallet
- All votes recorded on same blockchain

#### Quick ngrok Commands Reference

```bash
# Start backend tunnel
ngrok http 6001

# Start frontend tunnel  
ngrok http 5502

# View ngrok dashboard (shows requests, etc.)
# Open: http://localhost:4040 (after starting ngrok)

# Use custom domain (paid)
ngrok http 6001 --domain=your-domain.ngrok.app
```

#### Troubleshooting ngrok

**"Endpoint already online" error (ERR_NGROK_334):**
This means you're trying to start a tunnel that's already running. Solutions:

**Option 1: Stop existing tunnel**
```bash
# Find and kill existing ngrok process
# Mac/Linux:
pkill ngrok
# OR
killall ngrok

# Windows:
taskkill /F /IM ngrok.exe

# Then restart your tunnel
ngrok http 6001
```

**Option 2: Use different ports**
If you need multiple tunnels, use different local ports:
```bash
# Backend on port 6001
ngrok http 6001

# Frontend on port 5502 (different port = different tunnel)
ngrok http 5502
```

**Option 3: Use pooling (for same endpoint)**
If you want multiple tunnels to same endpoint:
```bash
ngrok http 6001 --pooling-enabled
```

**Option 4: Check running tunnels**
```bash
# View ngrok dashboard
# Open: http://localhost:4040
# Shows all active tunnels and their status
```

**"ngrok: command not found":**
- Add ngrok to your PATH
- Or use full path: `/path/to/ngrok http 6001`

**"Tunnel session failed":**
- Check your authtoken is set correctly
- Verify internet connection
- Try restarting ngrok

**CORS errors:**
- Backend automatically allows ngrok URLs (already configured)
- If still having issues, check ngrok dashboard for exact origin

**"ngrok free account" warning page:**
- Click "Visit Site" button to continue
- Or upgrade to paid plan to remove

**URLs change on restart:**
- This is normal for free tier
- Update frontend with new backend URL
- Or use reserved domain (paid)

**Multiple ngrok processes:**
```bash
# Check what's running
ps aux | grep ngrok  # Mac/Linux
tasklist | findstr ngrok  # Windows

# Kill all ngrok processes
pkill -9 ngrok  # Mac/Linux
taskkill /F /IM ngrok.exe  # Windows
```

### Option 2B: Deploy to a Public Server

**For Production/Testing:**
1. Deploy backend to a cloud service (Heroku, Railway, Render, etc.)
2. Deploy frontend to a static hosting service (Netlify, Vercel, GitHub Pages, etc.)
3. Update frontend's `BACKEND_ROOT` in `app.js` to point to your deployed backend URL
4. Access from any device using the public URL

### Option 3: Using Mobile Wallet Apps

Perfect for testing with users on phones/tablets. Each mobile device acts as a separate user.

#### Setup: Access Frontend from Mobile

**Option A: Same Wi-Fi Network (Recommended)**
1. Find your computer's IP address (see Option 1 instructions)
2. Start frontend server accessible to network:
   ```bash
   cd blockvote-frontend/frontend/web3
   python3 -m http.server 5502 --bind 0.0.0.0
   ```
3. On mobile device, connect to same Wi-Fi
4. Open browser on mobile: `http://YOUR_COMPUTER_IP:5502`
   - Example: `http://192.168.1.100:5502`

**Option B: Deploy to Public URL**
- Deploy frontend to Netlify/Vercel/GitHub Pages
- Access from any device using the public URL

#### Rabby Wallet Mobile - Step by Step

**1. Install Rabby Wallet:**
- iOS: App Store → Search "Rabby Wallet"
- Android: Google Play Store → Search "Rabby Wallet"
- Install and open the app

**2. Create/Import Wallet:**
- Tap "Create Wallet" or "Import Wallet"
- Follow setup instructions
- Save your seed phrase securely
- Set a password/PIN

**3. Add Sepolia Network:**
- Open Rabby app
- Tap "Networks" or settings icon
- Tap "Add Network" or "+"
- Enter Sepolia details:
  - **Network Name**: Sepolia
  - **RPC URL**: `https://eth-sepolia.g.alchemy.com/v2/xwlVwel0JeYZl1rGW_kgN`
  - **Chain ID**: 11155111
  - **Currency Symbol**: ETH
  - **Block Explorer**: `https://sepolia.etherscan.io`
- Save network
- Switch to Sepolia network

**4. Get Sepolia ETH:**
- Open mobile browser
- Go to a Sepolia faucet:
  - https://sepoliafaucet.com/
  - https://faucet.quicknode.com/ethereum/sepolia
- Enter your wallet address (copy from Rabby app)
- Request test ETH
- Wait for confirmation (usually 1-5 minutes)

**5. Access Frontend:**
- Open mobile browser (Safari/Chrome)
- Go to frontend URL (from Setup step above)
- The page should load normally

**6. Login/Register:**
- Register new account or login
- Fill in user details
- Complete authentication

**7. Connect Wallet:**
- Tap "Connect Wallet" button
- Rabby app will open automatically
- Approve connection request
- Switch to Sepolia if prompted
- Return to browser

**8. Vote:**
- Browse available elections
- Tap "Vote" button for your candidate
- Rabby app opens for transaction
- Review transaction details
- Approve transaction
- Wait for confirmation
- Return to browser to see updated results

#### MetaMask Mobile - Step by Step

**1. Install MetaMask:**
- iOS: App Store → "MetaMask"
- Android: Google Play → "MetaMask"
- Install and create/import wallet

**2. Add Sepolia Network:**
- Open MetaMask app
- Tap menu (☰) → Settings
- Tap "Networks" → "Add Network"
- Tap "Add a network manually"
- Enter:
  - **Network Name**: Sepolia
  - **RPC URL**: `https://eth-sepolia.g.alchemy.com/v2/xwlVwel0JeYZl1rGW_kgN`
  - **Chain ID**: 11155111
  - **Currency Symbol**: ETH
  - **Block Explorer URL**: `https://sepolia.etherscan.io`
- Tap "Save"
- Switch to Sepolia network

**3. Get Sepolia ETH:**
- Copy your wallet address from MetaMask
- Use mobile browser to access faucet
- Request test ETH
- Wait for confirmation

**4. Connect and Vote:**
- Open frontend URL in mobile browser
- Login/Register
- Tap "Connect Wallet"
- MetaMask app opens
- Approve connection
- Vote as normal

#### Mobile-Specific Tips

**Browser Compatibility:**
- **iOS**: Safari works best, Chrome also works
- **Android**: Chrome, Firefox, Brave all work
- Make sure browser supports Web3 (most modern browsers do)

**Wallet Connection:**
- Mobile wallets use "deep linking" to open apps
- If app doesn't open automatically:
  - Check wallet app is installed
  - Try refreshing the page
  - Manually open wallet app and check connection requests

**Network Switching:**
- Always ensure wallet is on Sepolia before voting
- The frontend will prompt to switch if needed
- Some wallets auto-switch, others require manual switch

**Transaction Confirmation:**
- Mobile wallets show transaction details clearly
- Review gas fees before confirming
- Transactions are the same as desktop (on-chain)

**Testing Multiple Mobile Users:**
- Each phone = different user
- Each phone needs its own wallet
- Each wallet needs Sepolia ETH
- All connect to same frontend URL
- All votes recorded on same blockchain

#### Troubleshooting Mobile Issues

**"Wallet not found" error:**
- Make sure Rabby/MetaMask app is installed
- Try refreshing the page
- Check app permissions in phone settings

**Can't connect wallet:**
- Ensure wallet app is unlocked
- Check if app needs to be opened first
- Try closing and reopening browser

**Transaction fails:**
- Check you have Sepolia ETH (not mainnet ETH)
- Ensure you're on Sepolia network
- Check internet connection

**Page doesn't load:**
- Verify computer and phone are on same Wi-Fi
- Check firewall settings on computer
- Try using computer's IP address instead of localhost

### Option 4: Different Browsers on Same Computer

**Easiest for Quick Testing:**
This is the simplest way to test with multiple users without needing multiple devices or network configuration.

#### Method A: Different Browsers with Separate Wallet Extensions

**Setup:**
1. Install multiple browsers (Chrome, Firefox, Safari, Edge, Brave, etc.)
2. Install Rabby Wallet or MetaMask in each browser
3. Create different wallet accounts in each browser's extension

**Step-by-Step:**

**User 1 Setup (Chrome):**
1. Open Chrome browser
2. Install Rabby Wallet extension (if not already installed)
3. Create/Import Wallet Account 1 in Rabby
4. Switch to Sepolia network in Rabby
5. Get Sepolia ETH for Account 1 (send to Account 1's address)
6. Open `http://localhost:5502` in Chrome
7. Register/Login with backend (e.g., `user1@example.com`)
8. Click "Connect Wallet" → Connect Account 1
9. Ready to vote!

**User 2 Setup (Firefox):**
1. Open Firefox browser
2. Install Rabby Wallet extension in Firefox
3. Create/Import Wallet Account 2 in Rabby (different from Account 1)
4. Switch to Sepolia network in Rabby
5. Get Sepolia ETH for Account 2 (send to Account 2's address)
6. Open `http://localhost:5502` in Firefox
7. Register/Login with backend (e.g., `user2@example.com`)
8. Click "Connect Wallet" → Connect Account 2
9. Ready to vote!

**User 3 Setup (Safari/Edge/Brave):**
- Repeat the same steps with another browser
- Use Account 3 with different backend login

#### Method B: Same Browser, Multiple Wallet Accounts

**If using Rabby Wallet:**
1. Open one browser (e.g., Chrome)
2. Install Rabby Wallet extension
3. Create multiple accounts in Rabby:
   - Click Rabby icon → Settings → Manage Accounts
   - Create Account 1, Account 2, Account 3, etc.
4. Switch between accounts when connecting wallet
5. Use different browser tabs/windows for each user session

**If using MetaMask:**
1. MetaMask supports multiple accounts in one extension
2. Create Account 1, Account 2, etc. in MetaMask
3. Switch accounts in MetaMask before connecting
4. Use different browser tabs for each user

**Limitation:** You'll need to manually switch accounts, which can be confusing. Method A (different browsers) is cleaner.

#### Quick Start Guide

**Prerequisites:**
- Backend running: `cd blockvote-backend && PORT=6001 node index.js`
- Frontend accessible: `http://localhost:5502`

**Testing with 2 Users:**

1. **Start Backend:**
   ```bash
   cd blockvote-backend
   PORT=6001 node index.js
   ```

2. **Start Frontend Server:**
   ```bash
   cd blockvote-frontend/frontend/web3
   python3 -m http.server 5502
   # OR
   npx http-server -p 5502
   ```

3. **User 1 (Chrome):**
   - Open Chrome
   - Go to `http://localhost:5502`
   - Login: `voter@blockvote.com` / `voter123`
   - Connect Rabby Wallet (Account 1)
   - Vote for Candidate A

4. **User 2 (Firefox):**
   - Open Firefox (keep Chrome open)
   - Go to `http://localhost:5502`
   - Register new account: `user2@test.com` / `password123`
   - Connect Rabby Wallet (Account 2 - different address)
   - Vote for Candidate B

5. **Verify Results:**
   - Both browsers show updated vote counts
   - Each vote is recorded on-chain with different wallet addresses

#### Tips for Multiple Browser Testing

**Wallet Management:**
- Label your accounts: "User 1 - Test", "User 2 - Test"
- Keep track of which account has Sepolia ETH
- Export/backup wallet seeds for testing accounts

**Backend Accounts:**
- Create different backend accounts for each user
- Or reuse `voter@blockvote.com` for quick testing
- Each browser session is independent

**Sepolia ETH Distribution:**
- Get Sepolia ETH from faucet
- Send to Account 1 address
- Send to Account 2 address
- Each account needs ~0.001 ETH minimum

**Browser Isolation:**
- Each browser has separate:
  - Local storage (login tokens)
  - Wallet extensions
  - Session data
- This makes testing clean and isolated

#### Troubleshooting

**"Wallet already connected" error:**
- Each browser manages its own wallet connection
- No conflict between browsers

**"You already voted" error:**
- This is correct! Each wallet address can only vote once
- Use a different wallet account for each user

**Can't see other user's votes:**
- Refresh the page to fetch latest on-chain data
- Votes are on-chain, so all browsers see the same results

**Wallet not connecting:**
- Make sure extension is installed in that browser
- Check extension is unlocked
- Try refreshing the page

### Device-Specific Instructions

#### Desktop/Laptop
- Use browser extensions (Rabby/MetaMask)
- Full feature access
- Best for admin operations

#### Mobile Phone/Tablet
- Use mobile wallet apps (Rabby/MetaMask mobile)
- Access via local network IP or deployed URL
- Touch-optimized interface
- Same voting functionality

#### Different Operating Systems
- **Windows/Mac/Linux**: All work the same way
- Just ensure backend is accessible from the device
- Use appropriate wallet for the OS

### Network Configuration Tips

**If devices can't connect:**

1. **Check Backend CORS Settings:**
   - In `blockvote-backend/index.js`, ensure CORS allows your device IPs:
   ```javascript
   const allowedOrigins = [
     "http://localhost:5502",
     "http://127.0.0.1:5502",
     "http://YOUR_IP:5502",  // Add your IP
     // ... other origins
   ];
   ```

2. **Check Firewall:**
   - Allow incoming connections on port 6001 (backend)
   - Allow incoming connections on port 5502 (frontend)

3. **Use ngrok for External Access (Alternative):**
   ```bash
   # Install ngrok: https://ngrok.com/
   # Expose backend:
   ngrok http 6001
   # Expose frontend:
   ngrok http 5502
   # Use the ngrok URLs on any device
   ```

### Testing Workflow Across Devices

**Scenario: Testing with 3 Users**

1. **Device 1 (Admin - Your Computer):**
   - Backend running on `localhost:6001`
   - Frontend on `localhost:5502`
   - Create elections
   - Monitor results

2. **Device 2 (Voter - Phone):**
   - Connect to same Wi-Fi
   - Open `http://YOUR_COMPUTER_IP:5502`
   - Login/Register
   - Connect mobile wallet
   - Vote

3. **Device 3 (Voter - Another Computer):**
   - Connect to same Wi-Fi
   - Open `http://YOUR_COMPUTER_IP:5502`
   - Login/Register
   - Connect wallet extension
   - Vote

**All votes are recorded on the same blockchain (Sepolia), so results are shared across all devices!**

## Viewing Results

- Vote counts update in real-time after each vote
- Results are stored on-chain and can be verified on Sepolia Etherscan
- Each vote is permanent and transparent on the blockchain

## Security Features

- **On-Chain Verification**: All votes are recorded on the blockchain
- **One Vote Per Address**: Enforced by the smart contract
- **Transparent**: Anyone can verify votes on Etherscan
- **Immutable**: Votes cannot be changed once confirmed

