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
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DB_NAME = 'blockvote';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Blockchain configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia.publicnode.com';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

let db;
let usersCollection;
let electionsCollection;
let provider;
let signer;
let contract;

// Connect to MongoDB
console.log('🔌 Attempting to connect to MongoDB...');

MongoClient.connect(MONGO_URI)
  .then(async client => {
    console.log('✅ Connected to MongoDB');
    db = client.db(DB_NAME);
    usersCollection = db.collection('users');
    electionsCollection = db.collection('elections');

    // Initialize blockchain provider and contract (non-blocking)
    // Blockchain is only needed for voting, not for election creation
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
      console.log('⚠️  Note: Blockchain is only used for voting, not election creation');
    } catch (error) {
      console.error('❌ Blockchain connection error:', error);
      console.log('⚠️  Server will continue without blockchain. Elections can still be created.');
      console.log('⚠️  Voting will require blockchain connection.');
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

    // Get the next election number for backward compatibility
    const lastElection = await electionsCollection.findOne({}, { sort: { electionNumber: -1 } });
    const electionNumber = (lastElection?.electionNumber || 0) + 1;

    // Create election document
    const newElection = {
      name: name || 'Untitled Election',
      description: description || '',
      candidates: finalCandidates,
      candidateNames: finalCandidates.map(c => c.name),
      electionNumber: electionNumber,
      candidateCount: finalCandidates.length,
      createdAt: Math.floor(Date.now() / 1000),
      durationSeconds: durationSeconds || 3600,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date(Date.now() + (durationSeconds || 3600) * 1000).toISOString(),
      status: 'upcoming',
      ended: false,
      createdBy: req.user.userId,
      creatorEmail: req.user.email,
      createdAtDate: new Date(),
      blockchainCreated: false,
      blockchainElectionId: null,
      geofence: req.body.geofence || {
        enabled: false,
        lat: 0,
        lng: 0,
        radius: 50,
        name: 'Voting Zone'
      }
    };

    // PERMANENT FIX: Create election on blockchain immediately
    if (contract) {
      try {
        console.log(`🔗 Creating election "${name}" on blockchain with ${finalCandidates.length} candidates...`);

        // Create election on blockchain
        const tx = await contract.createElection(finalCandidates.length);
        const receipt = await tx.wait();

        // Parse the ElectionCreated event to get the blockchain election ID
        const event = receipt.logs.find(log => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed && parsed.name === 'ElectionCreated';
          } catch (e) {
            return false;
          }
        });

        if (event) {
          const parsedEvent = contract.interface.parseLog(event);
          const blockchainElectionId = Number(parsedEvent.args.electionId);

          // Save blockchain ID to election document
          newElection.blockchainElectionId = blockchainElectionId;
          newElection.blockchainCreated = true;

          console.log(`✅ Election created on blockchain with ID: ${blockchainElectionId}`);
        } else {
          console.log('⚠️  ElectionCreated event not found in transaction receipt');
        }
      } catch (error) {
        console.error('❌ Failed to create election on blockchain:', error.message);
        // Continue anyway - election will be created on first vote (backward compatible)
      }
    } else {
      console.log('⚠️  Blockchain contract not initialized - election will be created on first vote');
    }

    // Insert to MongoDB
    const result = await electionsCollection.insertOne(newElection);

    res.json({
      success: true,
      electionId: result.insertedId.toString(),
      electionNumber: electionNumber,
      blockchainElectionId: newElection.blockchainElectionId
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

    // Find election by MongoDB _id
    const election = await electionsCollection.findOne({ _id: new ObjectId(id) });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Note: We no longer create elections on blockchain when activating
    // Elections will be created on blockchain lazily when the first vote happens
    // This keeps elections in MongoDB only

    // If ending election, also end it on blockchain (if it was created)
    if (status === 'ended' && election.blockchainElectionId) {
      try {
        const tx = await contract.endElection(election.blockchainElectionId);
        await tx.wait();
        console.log(`✅ Election ${election.blockchainElectionId} ended on blockchain`);
      } catch (blockchainError) {
        console.error('Blockchain election ending error:', blockchainError);
        // Don't fail the request if blockchain fails, just log it
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

// Update blockchain election ID (after creating election on blockchain)
app.patch('/election/:id/blockchain-id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchainElectionId } = req.body;

    if (!blockchainElectionId) {
      return res.status(400).json({ error: 'Blockchain election ID is required' });
    }

    const result = await electionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { blockchainElectionId, blockchainCreated: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Election not found' });
    }

    console.log(`✅ Saved blockchain election ID ${blockchainElectionId} for election ${id}`);

    res.json({
      success: true,
      message: 'Blockchain election ID updated'
    });
  } catch (error) {
    console.error('Update blockchain ID error:', error);
    res.status(500).json({ error: 'Failed to update blockchain election ID' });
  }
});

// Vote endpoint - validates election and returns election number for blockchain voting
// The frontend handles all blockchain interaction directly
app.post('/election/vote', verifyToken, async (req, res) => {
  try {
    const { electionId, candidateIndex } = req.body;

    // Find election by MongoDB _id
    const election = await electionsCollection.findOne({ _id: new ObjectId(electionId) });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Election is not active' });
    }

    if (election.ended) {
      return res.status(400).json({ error: 'Election has ended' });
    }

    if (candidateIndex < 0 || candidateIndex >= election.candidateNames.length) {
      return res.status(400).json({ error: 'Invalid candidate index' });
    }

    // Return election number for blockchain voting
    // The frontend will use this to vote on the blockchain
    // The blockchain will auto-create the election if it doesn't exist (via frontend)
    res.json({
      success: true,
      electionNumber: election.electionNumber,
      candidateCount: election.candidateCount || election.candidateNames.length,
      message: 'Election validated, ready for blockchain voting'
    });
  } catch (error) {
    console.error('Vote validation error:', error);
    res.status(500).json({ error: 'Failed to validate vote' });
  }
});

// Geofencing configuration endpoints
// GET - Public endpoint for all users to fetch geofence config
app.get('/geofence', async (req, res) => {
  try {
    const configCollection = db.collection('config');
    const config = await configCollection.findOne({ type: 'geofence' });

    if (!config) {
      // Return default config if none exists
      return res.json({
        enabled: false,
        lat: 0,
        lng: 0,
        radius: 50,
        name: 'Default Voting Zone'
      });
    }

    res.json({
      enabled: config.enabled,
      lat: config.lat,
      lng: config.lng,
      radius: config.radius,
      name: config.name
    });
  } catch (error) {
    console.error('Get geofence config error:', error);
    res.status(500).json({ error: 'Failed to get geofence config' });
  }
});

// POST - Admin only endpoint to save geofence config
app.post('/geofence', verifyToken, async (req, res) => {
  try {
    // Verify user is admin
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.userId) });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { enabled, lat, lng, radius, name } = req.body;

    const configCollection = db.collection('config');

    await configCollection.updateOne(
      { type: 'geofence' },
      {
        $set: {
          type: 'geofence',
          enabled: enabled !== undefined ? enabled : false,
          lat: lat || 0,
          lng: lng || 0,
          radius: radius || 50,
          name: name || 'Voting Zone',
          updatedAt: new Date(),
          updatedBy: req.user.userId
        }
      },
      { upsert: true }
    );

    console.log(`✅ Geofence config updated by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'Geofence configuration saved'
    });
  } catch (error) {
    console.error('Save geofence config error:', error);
    res.status(500).json({ error: 'Failed to save geofence config' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve simple status for root path
app.get('/', (req, res) => {
  res.json({ message: 'BlockVote Backend API is running' });
});

// Get all elections
app.get('/elections', async (req, res) => {
  try {
    // Auto-end elections that have passed their endTime
    const now = new Date();
    console.log(`Checking for elections to auto-end at: ${now.toISOString()}`);

    const result = await electionsCollection.updateMany(
      {
        status: 'active',
        endTime: { $lte: now.toISOString() },
        ended: false
      },
      {
        $set: { status: 'ended', ended: true, endedAt: now }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Auto-ended ${result.modifiedCount} election(s)`);
    }

    const elections = await electionsCollection.find({}).toArray();

    // Format elections for frontend
    const formattedElections = elections.map(election => ({
      id: election._id.toString(),
      name: election.name,
      description: election.description,
      startTime: election.startTime,
      endTime: election.endTime,
      status: election.status,
      ended: election.ended,
      candidates: election.candidates,
      candidateNames: election.candidateNames,
      electionNumber: election.electionNumber,
      blockchainElectionId: election.blockchainElectionId,
      blockchainCreated: election.blockchainCreated || false
    }));

    res.json(formattedElections);
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ error: 'Failed to fetch elections' });
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