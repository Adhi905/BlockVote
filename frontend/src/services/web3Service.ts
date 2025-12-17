import { ethers } from 'ethers';
import votingAbi from './votingAbi.json';
import deployedVoting from './deployed_voting.json';

export interface Candidate {
  name: string;
  votes: number;
}

export interface ElectionInfo {
  id: number;
  candidateCount: number;
  ended: boolean;
  createdAt: number;
}

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private address: string | null = null;

  constructor() {
    this.initContract();

    // Listen for chain changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', (_chainId: string) => {
        // Reload the page to ensure contract is reinitialized with correct network
        window.location.reload();
      });
    }
  }

  private async initContract() {
    try {
      // Initialize contract for read-only operations (fetching votes)
      // This works without wallet connection
      // Use Vite's environment variable syntax
      const rpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/xwlVwel0JeYZl1rGW_kgN';


      const provider = new ethers.JsonRpcProvider(rpcUrl);

      this.contract = new ethers.Contract(
        deployedVoting.address,
        votingAbi,
        provider
      );


    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  }

  // Helper to wait for window.ethereum to be injected (common issue in mobile browsers)
  private async waitForEthereum(timeout = 3000): Promise<any> {
    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.ethereum) {
          clearInterval(interval);
          resolve(window.ethereum);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  async connectWallet(): Promise<{ address: string; network: string }> {
    // Wait for injection
    const ethereum = await this.waitForEthereum();

    if (!ethereum) {
      throw new Error('Wallet not found. Please verify you are using a Web3-enabled browser (MetaMask, Coinbase Wallet, etc.)');
    }

    try {
      // Initialize BrowserProvider here
      this.provider = new ethers.BrowserProvider(ethereum);

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.address = accounts[0];
      this.signer = await this.provider.getSigner();

      // Update contract with signer
      this.contract = new ethers.Contract(
        deployedVoting.address,
        votingAbi,
        this.signer
      );

      // Get network info and validate it's Sepolia
      const network = await this.provider.getNetwork();

      // Check if we're on the correct network (Sepolia)
      // Note: Some mobile wallets might have issues switching programmatically
      // We'll try, but provide clear error if it fails
      if (Number(network.chainId) !== 11155111) {
        // Try to switch to Sepolia network
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
          });

          // Re-get network info after switching
          const newNetwork = await this.provider.getNetwork();
          return {
            address: this.address,
            network: newNetwork.name
          };
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
              });

              // Re-get network info after adding
              const newNetwork = await this.provider.getNetwork();
              return {
                address: this.address,
                network: newNetwork.name
              };
            } catch (addError) {
              console.error('Failed to add Sepolia network:', addError);
              throw new Error('Please switch to Sepolia network (Chain ID: 11155111) manually in your wallet.');
            }
          } else {
            console.error('Failed to switch to Sepolia network:', switchError);
            // Even if switching fails, we can still return the current network info
            // But warns the user
            return {
              address: this.address,
              network: network.name + ' (Please switch to Sepolia)'
            };
          }
        }
      }

      return {
        address: this.address,
        network: network.name
      };
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  // Check if wallet is already connected (replaces direct window.ethereum check)
  async checkConnection(): Promise<{ address: string; network: string } | null> {
    const ethereum = await this.waitForEthereum(1000); // Shorter timeout for check
    if (!ethereum) return null;

    try {
      this.provider = new ethers.BrowserProvider(ethereum);
      const accounts = await this.provider.listAccounts();
      if (accounts.length > 0) {
        this.address = accounts[0].address;
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(
          deployedVoting.address,
          votingAbi,
          this.signer
        );
        const network = await this.provider.getNetwork();
        return {
          address: this.address,
          network: network.name
        };
      }
    } catch (e) {
      console.error("Silent connection check failed:", e);
    }
    return null;
  }

  async disconnectWallet() {
    this.address = null;
    this.signer = null;
    if (this.provider) {
      this.contract = new ethers.Contract(
        deployedVoting.address,
        votingAbi,
        this.provider
      );
    }
  }

  getConnectedAddress(): string | null {
    return this.address;
  }

  isConnected(): boolean {
    return this.address !== null;
  }

  // Election creation is now handled by the backend/MongoDB
  // This method is kept for backward compatibility but not used
  async createElection(candidateNames: string[]): Promise<number> {
    throw new Error('Elections are created via backend API, not blockchain');
  }

  async vote(electionId: number, candidateIndex: number): Promise<void> {
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      // Validate we're on the correct network before voting
      const network = await this.provider?.getNetwork();
      if (network && Number(network.chainId) !== 11155111) {
        throw new Error('Please switch to Sepolia network (Chain ID: 11155111)');
      }

      const contractWithSigner = this.contract.connect(this.signer) as any;
      const tx = await contractWithSigner.vote(electionId, candidateIndex);
      await tx.wait();
    } catch (error: any) {
      console.error('Error voting:', error);
      if (error.message.includes('Already voted') || error.message.includes('already voted')) {
        throw new Error('You have already voted in this election');
      }
      // Handle network errors specifically
      if (error.code === 'NETWORK_ERROR' || (error.message && error.message.includes('network'))) {
        throw new Error('Please switch to Sepolia network (Chain ID: 11155111)');
      }
      // Re-throw the error so caller can handle "election not found"
      throw error;
    }
  }

  // Helper method to create election on blockchain and vote in sequence
  // Used when election doesn't exist on blockchain yet
  // Returns the blockchain election ID that was created
  async createElectionAndVote(candidateCount: number, candidateIndex: number): Promise<number> {
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {


      // Step 1: Create election on blockchain
      const contractWithSigner = this.contract.connect(this.signer) as any;
      const createTx = await contractWithSigner.createElection(candidateCount);
      const receipt = await createTx.wait();

      // Extract the blockchain election ID from the ElectionCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          return parsedLog && parsedLog.name === 'ElectionCreated';
        } catch (e) {
          return false;
        }
      });

      if (!event) {
        throw new Error('Could not find ElectionCreated event');
      }

      const parsedLog = this.contract.interface.parseLog(event);
      const blockchainElectionId = Number(parsedLog.args.electionId);


      // Step 2: Vote using the actual blockchain election ID
      const voteTx = await contractWithSigner.vote(blockchainElectionId, candidateIndex);
      await voteTx.wait();



      return blockchainElectionId;
    } catch (error: any) {
      console.error('Error creating election and voting:', error);
      throw new Error(error.message || 'Failed to create election and vote');
    }
  }

  // Election ending is now handled by the backend/MongoDB
  // Blockchain only stores votes
  async endElection(electionId: number): Promise<void> {
    throw new Error('Elections are ended via backend API, not blockchain');
  }

  // Election info is now fetched from MongoDB via backend API
  // This method is kept for backward compatibility
  async getElectionInfo(electionId: number): Promise<ElectionInfo> {
    throw new Error('Election info should be fetched from backend API');
  }

  // Get vote counts from blockchain
  // Votes are stored on blockchain for transparency
  async getVotes(electionId: number): Promise<number[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const contractWithAny = this.contract as any;
      const votes = await contractWithAny.getVotes(electionId);
      return votes.map((v: bigint) => Number(v));
    } catch (error: any) {
      console.error('Error getting votes:', error);
      throw new Error(error.message || 'Failed to get votes');
    }
  }

  async hasVoted(electionId: number, voterAddress?: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const address = voterAddress || this.address;
    if (!address) {
      throw new Error('No address provided');
    }

    try {
      const contractWithAny = this.contract as any;
      return await contractWithAny.hasVotedFor(electionId, address);
    } catch (error: any) {
      console.error('Error checking vote status:', error);
      throw new Error(error.message || 'Failed to check vote status');
    }
  }

  // Election IDs are managed by MongoDB
  // This method is no longer needed
  async getNextElectionId(): Promise<number> {
    throw new Error('Election IDs are managed by backend/MongoDB');
  }
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const web3Service = new Web3Service();
