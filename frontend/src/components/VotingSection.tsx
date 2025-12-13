import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CandidateCard } from "./CandidateCard";
import { VoteConfirmation } from "./VoteConfirmation";
import { AlertCircle, Vote, Wallet } from "lucide-react";
import { web3Service } from "@/services/web3Service";
import { apiService } from "@/services/apiService";
import { toast } from "@/hooks/use-toast";

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  votes: number;
  color: string;
}

interface VotingSectionProps {
  isConnected: boolean;
  onConnectWallet: () => void;
  isLocationVerified?: boolean;
}

export const VotingSection = ({ isConnected, onConnectWallet, isLocationVerified = false }: VotingSectionProps) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeElections, setActiveElections] = useState<any[]>([]);
  const [selectedElectionIndex, setSelectedElectionIndex] = useState(0);
  const currentElection = activeElections[selectedElectionIndex];

  useEffect(() => {
    loadActiveElections();
  }, [isConnected]);

  const loadActiveElections = async () => {
    try {
      // Fetch all elections from MongoDB
      const elections = await apiService.getAllElections();
      const activeElectionsList = elections.filter((e: any) => e.status === "active");

      if (activeElectionsList.length > 0) {
        setActiveElections(activeElectionsList);
        setSelectedElectionIndex(0);

        // Load candidates for first election
        loadCandidatesForElection(activeElectionsList[0]);
      } else {
        // No active elections found
        setActiveElections([]);
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error loading elections:', error);
    }
  };

  const loadCandidatesForElection = (election: any) => {
    // Map candidates from MongoDB format  
    const candidatesData = election.candidates.map((candidate: any, index: number) => ({
      id: String(index),
      name: candidate.name || candidate,
      party: candidate.party || "Independent",
      description: candidate.description || `Candidate ${index + 1}`,
      votes: 0, // Will be loaded from blockchain if connected
      color: `hsl(${120 + index * 40}, ${60 + index * 5}%, 45%)`,
    }));

    setCandidates(candidatesData);
    setSelectedCandidate(null);
    setHasVoted(false);
  };

  const handleElectionChange = (index: number) => {
    setSelectedElectionIndex(index);
    loadCandidatesForElection(activeElections[index]);
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;

    if (!currentElection) {
      toast({
        title: "No Active Election",
        description: "This election is not available for voting yet.",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(true);

    try {
      // Step 1: Validate election with backend
      const validateResponse = await apiService.vote(currentElection.id, parseInt(selectedCandidate));

      if (!validateResponse.electionNumber) {
        throw new Error('Failed to validate election');
      }



      // Step 2: Vote directly using blockchain ID
      // Elections are now created on blockchain immediately, so blockchainElectionId should always exist
      if (!currentElection.blockchainElectionId) {
        // Backward compatibility: If election doesn't have blockchain ID (old election)
        // Create it on blockchain first

        const blockchainElectionId = await web3Service.createElectionAndVote(
          validateResponse.candidateCount || currentElection.candidates.length,
          parseInt(selectedCandidate)
        );

        // Save the blockchain election ID to MongoDB

        await apiService.updateElectionBlockchainId(currentElection.id, blockchainElectionId);
      } else {
        // Normal path: Election already has blockchain ID from creation
        const blockchainElectionId = currentElection.blockchainElectionId;

        await web3Service.vote(blockchainElectionId, parseInt(selectedCandidate));
      }

      setHasVoted(true);
      setShowConfirmation(true);

      // Reload elections to update vote counts
      await loadActiveElections();

      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded on the blockchain.",
      });
    } catch (error: any) {
      console.error('Voting error:', error);
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to submit vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);

  return (
    <section id="vote" className="py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 uppercase tracking-tight">
            Cast Your <span className="gradient-text text-glow">Vote</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Select your preferred candidate below. Your vote will be securely recorded on the blockchain.
          </p>
        </div>

        {!isConnected ? (
          <div className="max-w-lg mx-auto glass p-10 rounded-3xl text-center border-primary/20">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-3 uppercase">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-8">
              To participate in the election, please connect your blockchain wallet first.
            </p>
            <Button variant="wallet" size="lg" onClick={onConnectWallet}>
              <Wallet className="w-5 h-5" />
              Connect Wallet to Vote
            </Button>
          </div>
        ) : !isLocationVerified ? (
          <div className="max-w-lg mx-auto glass p-10 rounded-3xl text-center border-accent/20">
            <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-3 uppercase">Location Required</h3>
            <p className="text-muted-foreground mb-4">
              Please verify your location above to proceed with voting.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="max-w-lg mx-auto glass p-10 rounded-3xl text-center border-border/50">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Vote className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-3 uppercase">No Active Elections</h3>
            <p className="text-muted-foreground">
              There are currently no elections available for voting. Please check back later.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Election Selector - Show only if multiple elections */}
            {activeElections.length > 1 && (
              <div className="glass p-6 rounded-2xl border-primary/20">
                <h3 className="text-lg font-bold mb-4">Select Election</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeElections.map((election, index) => (
                    <button
                      key={election.id}
                      onClick={() => handleElectionChange(index)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${index === selectedElectionIndex
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className="font-bold">{election.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {election.candidates.length} candidates
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Election Info */}
            {currentElection && (
              <div className="glass p-6 rounded-2xl border-primary/20">
                <h3 className="text-2xl font-bold mb-2">{currentElection.name}</h3>
                <p className="text-muted-foreground">{currentElection.description}</p>
              </div>
            )}

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={selectedCandidate === candidate.id}
                  onSelect={setSelectedCandidate}
                  hasVoted={hasVoted}
                />
              ))}
            </div>

            {!hasVoted && (
              <div className="text-center">
                <Button
                  variant="hero"
                  size="xl"
                  disabled={!selectedCandidate || isVoting}
                  onClick={handleVote}
                  className="w-full sm:min-w-[280px] sm:w-auto"
                >
                  {isVoting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Vote className="w-6 h-6" />
                      Submit Vote
                    </>
                  )}
                </Button>
                {selectedCandidate && (
                  <p className="text-muted-foreground mt-6">
                    You are voting for <span className="text-primary font-bold">{selectedCandidateData?.name}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <VoteConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        candidateName={selectedCandidateData?.name || ""}
      />
    </section>
  );
};
