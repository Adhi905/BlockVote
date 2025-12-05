import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { VotingSection } from "@/components/VotingSection";
import { SecuritySection } from "@/components/SecuritySection";
import { Footer } from "@/components/Footer";
import { LocationVerification } from "@/components/LocationVerification";
import { toast } from "@/hooks/use-toast";
import { web3Service } from "@/services/web3Service";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const votingSectionRef = useRef<HTMLDivElement>(null);

  const handleConnect = async () => {
    try {
      const { address } = await web3Service.connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
      toast({
        title: "Wallet Connected",
        description: "You can now participate in the election.",
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const scrollToVoting = () => {
    votingSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={isConnected}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      <main>
        <HeroSection onStartVoting={scrollToVoting} />
        
        <div ref={votingSectionRef}>
          {/* Location Verification - shown before voting */}
          {isConnected && !isLocationVerified && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <LocationVerification 
                  isVerified={isLocationVerified}
                  onVerified={setIsLocationVerified}
                />
              </div>
            </section>
          )}
          
          {/* Voting Section - only shown after location is verified */}
          <VotingSection 
            isConnected={isConnected} 
            onConnectWallet={handleConnect}
            isLocationVerified={isLocationVerified}
          />
        </div>
        
        {/* Results Section removed for voters */}
        <SecuritySection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
