const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const votingAbi = require('./votingAbi.json');
const deployedVoting = require('./deployed_voting.json');

// Create Express app
const app = express();
const PORT = process.env.PORT || 6001;

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'blockvote';
const JWT_SECRET = 'your-secret-key-change-in-production';

// Blockchain configuration
const SEPOLIA_RPC_URL = 'https://rpc.sepolia.org';
const ADMIN_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // This is the default Hardhat private key

let db;
let usersCollection;
let electionsCollection;
let provider;
let signer;
let contract;

// Connect to MongoDB
MongoClient.connect(MONGO_URI)
  .then(async client => {
    console.log('✅ Connected to MongoDB');
    db = client.db(DB_NAME);
    usersCollection = db.collection('users');
    electionsCollection = db.collection('elections');
    
    // Initialize blockchain provider and contract
    try {
      console.log('Initializing blockchain connection...');
      provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
      contract = new ethers.Contract(
        deployedVoting.address,
        votingAbi,
        signer
      );
      
      console.log('✅ Connected to blockchain contract at:', deployedVoting.address);
    } catch (error) {
      console.error('❌ Blockchain connection error:', error);
    }
    
    // Create initial admin user if not exists
    console.log('Creating initial users...');
    await createInitialUsers();
    console.log('Initial users created.');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Create initial users
async function createInitialUsers() {
  try {
    const adminExists = await usersCollection.findOne({ email: 'admin@blockvote.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await usersCollection.insertOne({
        email: 'admin@blockvote.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✅ Admin user created');
    }
    
    const voterExists = await usersCollection.findOne({ email: 'voter@blockvote.com' });
    if (!voterExists) {
      const hashedPassword = await bcrypt.hash('voter123', 10);
      await usersCollection.insertOne({
        email: 'voter@blockvote.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Voter',
        role: 'voter',
        createdAt: new Date()
      });
      console.log('✅ Demo voter created');
    }
  } catch (error) {
    console.error('Error creating initial users:', error);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Helper function to generate tokens
const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Authentication routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id.toString(), user.email, user.role);
    
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'voter', age, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      age,
      phone,
      address,
      createdAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    const token = generateToken(result.insertedId.toString(), email, role);
    
    res.json({
      token,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Election routes
app.post('/election/create', verifyToken, async (req, res) => {
  try {
    const { candidateNames, candidates, durationSeconds, name, description, startTime, endTime } = req.body;
    
    // Support both old format (candidateNames) and new format (candidates with party)
    let finalCandidates = [];
    if (candidates && Array.isArray(candidates)) {
      // New format: [{name: 'John', party: 'Party A'}, ...]
      finalCandidates = candidates;
    } else if (candidateNames && Array.isArray(candidateNames)) {
      // Old format: ['John', 'Jane', ...]
      finalCandidates = candidateNames.map(name => ({ name, party: 'Independent' }));
    }
    
    if (!finalCandidates || finalCandidates.length < 2) {
      return res.status(400).json({ error: 'At least 2 candidates required' });
    }
    
    // Create election on blockchain first
    let blockchainElectionId;
    try {
      const tx = await contract.createElection(finalCandidates.length);
      const receipt = await tx.wait();
      
      // Extract the election ID from the event logs
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog && parsedLog.name === 'ElectionCreated';
        } catch (e) {
          return false;
        }
      });
      
      if (event) {
        const parsedLog = contract.interface.parseLog(event);
        blockchainElectionId = Number(parsedLog.args.electionId);
      } else {
        throw new Error('Could not find ElectionCreated event');
      }
    } catch (blockchainError) {
      console.error('Blockchain election creation error:', blockchainError);
      return res.status(500).json({ error: 'Failed to create election on blockchain: ' + blockchainError.message });
    }
    
    const newElection = {
      name: name || 'Untitled Election',
      description: description || '',
      candidates: finalCandidates,
      candidateNames: finalCandidates.map(c => c.name), // For backward compatibility
      blockchainElectionId: blockchainElectionId,
      candidateCount: finalCandidates.length,
      createdAt: Math.floor(Date.now() / 1000),
      durationSeconds: durationSeconds || 3600,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date(Date.now() + (durationSeconds || 3600) * 1000).toISOString(),
      status: 'upcoming',
      ended: false,
      createdBy: req.user.userId,
      creatorEmail: req.user.email,
      createdAtDate: new Date()
    };
    
    const result = await electionsCollection.insertOne(newElection);
    
    res.json({
      success: true,
      electionId: result.insertedId.toString(),
      blockchainElectionId: blockchainElectionId
    });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ error: 'Failed to create election' });
  }
});

app.get('/election/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find election by MongoDB _id
    const election = await electionsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    res.json({
      id: election._id.toString(),
      candidateNames: election.candidateNames,
      createdAt: election.createdAt,
      durationSeconds: election.durationSeconds,
      ended: election.ended
    });
  } catch (error) {
    console.error('Get election info error:', error);
    res.status(500).json({ error: 'Failed to get election info' });
  }
});

app.post('/election/end', verifyToken, async (req, res) => {
  try {
    const { electionId } = req.body;
    
    // Find election by MongoDB _id
    const election = await electionsCollection.findOne({ _id: new ObjectId(electionId) });
    
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    await electionsCollection.updateOne(
      { _id: election._id },
      { $set: { ended: true, status: 'ended', endedAt: new Date() } }
    );
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('End election error:', error);
    res.status(500).json({ error: 'Failed to end election' });
  }
});

// Delete election
app.delete('/election/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Note: We don't delete elections from the blockchain as that's not possible
    // We only delete from MongoDB
    
    // Find and delete election by MongoDB _id
    const result = await electionsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    res.json({
      success: true,
      message: 'Election deleted successfully'
    });
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({ error: 'Failed to delete election' });
  }
});

// Update election status (for starting elections)
app.patch('/election/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['upcoming', 'active', 'ended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // If ending election, also end it on blockchain
    if (status === 'ended') {
      // Find election by MongoDB _id
      const election = await electionsCollection.findOne({ _id: new ObjectId(id) });
      
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }
      
      // End election on blockchain
      try {
        const tx = await contract.endElection(election.blockchainElectionId);
        await tx.wait();
      } catch (blockchainError) {
        console.error('Blockchain election ending error:', blockchainError);
        // Don't fail the request if blockchain fails, just log it
        // In production, you might want to handle this differently
      }
    }
    
    const result = await electionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, ...(status === 'ended' ? { ended: true, endedAt: new Date() } : {}) } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    res.json({
      success: true,
      message: `Election status updated to ${status}`
    });
  } catch (error) {
    console.error('Update election status error:', error);
    res.status(500).json({ error: 'Failed to update election status' });
  }
});

// Note: Votes are stored on blockchain, not in MongoDB
// This endpoint validates election exists and tracks which users voted (optional)
app.post('/election/vote', verifyToken, async (req, res) => {
  try {
    const { electionId, candidateIndex } = req.body;
    
    // Find election by MongoDB _id
    const election = await electionsCollection.findOne({ _id: new ObjectId(electionId) });
    
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    if (election.ended) {
      return res.status(400).json({ error: 'Election has ended' });
    }
    
    if (candidateIndex < 0 || candidateIndex >= election.candidateNames.length) {
      return res.status(400).json({ error: 'Invalid candidate index' });
    }
    
    // Vote is stored on blockchain, not in MongoDB
    // You can optionally track who voted in MongoDB for analytics
    res.json({
      success: true,
      message: 'Vote will be recorded on blockchain'
    });
  } catch (error) {
    console.error('Vote validation error:', error);
    res.status(500).json({ error: 'Failed to validate vote' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Get all elections
app.get('/elections', async (req, res) => {
  try {
    const elections = await electionsCollection.find({}).toArray();
    res.json(elections.map(e => ({
      id: e._id.toString(),
      name: e.name || 'Untitled Election',
      description: e.description || '',
      candidates: e.candidates || e.candidateNames?.map(name => ({ name, party: 'Independent' })) || [],
      candidateNames: e.candidateNames || [],
      blockchainElectionId: e.blockchainElectionId,
      candidateCount: e.candidateCount || e.candidateNames?.length || 0,
      createdAt: e.createdAt,
      durationSeconds: e.durationSeconds,
      startTime: e.startTime,
      endTime: e.endTime,
      status: e.status || (e.ended ? 'ended' : 'upcoming'),
      ended: e.ended
    })));
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ error: 'Failed to get elections' });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 BlockVote Backend Server running on port ${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📂 Database: ${DB_NAME}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;