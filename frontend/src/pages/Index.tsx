import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { VotingSection } from "@/components/VotingSection";
import { SecuritySection } from "@/components/SecuritySection";
import { Footer } from "@/components/Footer";
import { useLocationVerification } from "@/hooks/useLocationVerification";
import { toast } from "@/hooks/use-toast";
import { web3Service } from "@/services/web3Service";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const votingSectionRef = useRef<HTMLDivElement>(null);

  // Geofence config logic removed - moving to per-election check
  const { verifyLocation } = useLocationVerification();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    // Robust check using web3Service helper that handles mobile timing
    const connection = await web3Service.checkConnection();
    if (connection) {
      setIsConnected(true);
      setWalletAddress(connection.address);
      toast({
        title: "Wallet Connected",
        description: `Restored connection: ${connection.address.slice(0, 6)}...`
      });
    } else {
      setIsConnected(false);
    }
  };

  const handleConnect = async () => {
    try {
      const result = await web3Service.connectWallet();
      // web3Service.connectWallet returns { address, network }
      const address = result.address;

      setIsConnected(!!address);
      if (address) {
        setWalletAddress(address);
        toast({
          title: "Wallet Connected",
          description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
        });
      }
    } catch (error: any) {
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

        <div ref={votingSectionRef} className="py-16 container mx-auto px-4">
          <VotingSection
            isConnected={isConnected}
            onConnectWallet={handleConnect}
            isLocationVerified={true} // Always verified globally, specific check is inside VotingSection
            onVerifyLocation={verifyLocation}
          />
        </div>

        <SecuritySection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
