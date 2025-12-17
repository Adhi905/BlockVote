import { useLocationVerification } from "@/hooks/useLocationVerification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationVerificationProps {
  onVerified: (verified: boolean) => void;
  isVerified: boolean;
  allowedArea?: {
    lat: number;
    lng: number;
    radius: number; // in km
    name: string;
  };
}

// Default allowed voting area (can be configured by admin)
const DEFAULT_ALLOWED_AREA = {
  lat: 0,
  lng: 0,
  radius: 50000,
  name: "Authorized Voting Zone",
};

export const LocationVerification = ({
  onVerified,
  isVerified,
  allowedArea = DEFAULT_ALLOWED_AREA
}: LocationVerificationProps) => {
  const {
    verifyLocation: executeVerification,
    isVerifying: isChecking,
    locationError,
    userLocation
  } = useLocationVerification(allowedArea);

  const verifyLocation = async () => {
    const success = await executeVerification();
    if (success) {
      onVerified(true);
      // Success toast is handled here for the manual "Verify Location" button click
      toast({
        title: "Location Verified",
        description: `You are within the ${allowedArea.name}. You can now vote.`,
      });
    }
  };

  return (
    <Card className="glass p-8 border-primary/20 max-w-lg mx-auto mb-12">
      <div className="text-center">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isVerified
          ? "bg-primary/20"
          : locationError
            ? "bg-destructive/20"
            : "bg-accent/20"
          }`}>
          {isVerified ? (
            <CheckCircle2 className="w-10 h-10 text-primary" />
          ) : locationError ? (
            <XCircle className="w-10 h-10 text-destructive" />
          ) : (
            <MapPin className="w-10 h-10 text-accent" />
          )}
        </div>

        <h3 className="text-2xl font-black mb-3 uppercase">
          {isVerified ? "Location Verified" : "Verify Your Location"}
        </h3>

        <p className="text-muted-foreground mb-6">
          {isVerified
            ? "Your location has been verified. You can now proceed to vote."
            : "Before voting, we need to verify you are within the authorized voting area."}
        </p>

        {locationError && (
          <p className="text-destructive text-sm mb-4">{locationError}</p>
        )}

        {userLocation && !isVerified && (
          <p className="text-muted-foreground text-sm mb-4">
            Your coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}

        {!isVerified && (
          <Button
            variant="hero"
            size="lg"
            onClick={verifyLocation}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking Location...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                {locationError ? "Try Again" : "Verify Location"}
              </>
            )}
          </Button>
        )}

        {isVerified && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Ready to Vote</span>
          </div>
        )}
      </div>
    </Card>
  );
};
