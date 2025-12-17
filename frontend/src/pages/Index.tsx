import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { VotingSection } from "@/components/VotingSection";
import { SecuritySection } from "@/components/SecuritySection";
import { Footer } from "@/components/Footer";
import { LocationVerification } from "@/components/LocationVerification";
import { useLocationVerification } from "@/hooks/useLocationVerification";
import { toast } from "@/hooks/use-toast";
import { web3Service } from "@/services/web3Service";
import { apiService } from "@/services/apiService";

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
  const [geofenceLoading, setGeofenceLoading] = useState(true);
  const votingSectionRef = useRef<HTMLDivElement>(null);

  // Initialize location verification hook
  // We use the hook here so we can pass the verify function to VotingSection
  const { verifyLocation } = useLocationVerification(
    geofenceConfig || undefined
  );

  useEffect(() => {
    const fetchGeofenceConfig = async () => {
      try {
        const config = await apiService.getGeofenceConfig();
        setGeofenceConfig(config);
        // If geofencing is explicitly disabled by admin, auto-verify location
        if (config.enabled === false) {
          setIsLocationVerified(true);
        }
      } catch (error) {
        console.error("Failed to fetch geofence config:", error);
        // On error, default to requiring location verification for security
        setGeofenceConfig({
          enabled: true,
          lat: 0,
          lng: 0,
          radius: 50,
          name: "Voting Zone"
        });
      } finally {
        setGeofenceLoading(false);
      }
    };

    fetchGeofenceConfig();
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
            onVerifyLocation={verifyLocation}
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
