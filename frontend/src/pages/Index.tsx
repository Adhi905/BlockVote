import { useState, useRef, useEffect } from "react";
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
  const [geofenceConfig, setGeofenceConfig] = useState<{
    lat: number;
    lng: number;
    radius: number;
    name: string;
    enabled: boolean;
  } | null>(null);
  const votingSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedCallback = () => {
      const stored = localStorage.getItem("blockvote_geofence");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setGeofenceConfig(parsed);
          // If geofencing is explicitly disabled in config, we consider location verified
          if (parsed.enabled === false) {
            setIsLocationVerified(true);
          }
        } catch (e) {
          console.error("Failed to parse geofence config", e);
        }
      } else {
        // If no config exists, we default to verified (or you could strictly require it)
        // For now, let's assume no config means no restriction
        setIsLocationVerified(true);
      }
    };

    storedCallback();
    // Optional: listen for storage events if you want real-time updates across tabs
    window.addEventListener('storage', storedCallback);
    return () => window.removeEventListener('storage', storedCallback);
  }, []);

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
                  allowedArea={geofenceConfig || undefined}
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
