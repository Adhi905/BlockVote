# BlockVote Development Environment

This project contains a blockchain-based voting platform with separate backend, blockchain, and frontend components.

## Project Structure

```
BlockVoteProject 2/
├── backend/              # Backend REST API (Node.js/Express)
├── blockchain/           # Smart contracts (Hardhat/Solidity)
├── frontend/             # Modern React/Vite frontend
├── legacy-frontend/      # Legacy HTML/CSS/JS frontend
└── start.js             # Quick start script for legacy setup
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (for backend data storage)
- MetaMask or similar Web3 wallet

## Quick Start

### Option 1: Legacy Frontend (HTML/CSS/JS)

To start the backend API and legacy HTML frontend:

```bash
node start.js
```

This will start:
- Backend API server on http://localhost:6001
- Legacy Frontend UI on http://localhost:5502

### Option 2: Modern React Frontend

To run the modern React/Vite frontend:

```bash
# Terminal 1: Start backend
cd backend
npm install
npm start

# Terminal 2: Start React frontend
cd frontend
npm install
npm run dev
```

### Option 3: Full Blockchain Development

```bash
# Terminal 1: Start local blockchain
cd blockchain
npm install
npx hardhat node

# Terminal 2: Deploy contracts
cd blockchain
npx hardhat run --network localhost scripts/deploy_voting.js

# Terminal 3: Start backend
cd backend
npm install
npm start

# Terminal 4: Start frontend
cd frontend
npm install
npm run dev
```

## Component Details

### Backend (`/backend`)
REST API server handling authentication, voting operations, and blockchain interactions.
- Main file: `src/index.js`
- Port: 6001

### Blockchain (`/blockchain`)
Hardhat project containing Solidity smart contracts for secure voting.
- Contract: `contracts/Voting.sol`
- Deploy script: `scripts/deploy_voting.js`

### Frontend (`/frontend`)
Modern React application with TypeScript, Vite, and shadcn/ui components.
- Framework: React + Vite
- UI Library: shadcn/ui + Tailwind CSS

### Legacy Frontend (`/legacy-frontend`)
Original HTML/CSS/JS frontend for basic voting interface.
- Entry point: `index.html`
- Dashboards: `admin-dashboard.html`, `voter-dashboard.html`