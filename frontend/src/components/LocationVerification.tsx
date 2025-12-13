import { useState } from "react";
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
  radius: 50000, // Very large radius for demo - essentially allows anywhere
  name: "Authorized Voting Zone",
};

export const LocationVerification = ({
  onVerified,
  isVerified,
  allowedArea = DEFAULT_ALLOWED_AREA
}: LocationVerificationProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const verifyLocation = () => {
    setIsChecking(true);
    setLocationError(null);

    // Check if using HTTPS (required for geolocation on mobile)
    if (!window.isSecureContext) {
      setLocationError("Geolocation requires secure connection (HTTPS). Please access the site via HTTPS.");
      setIsChecking(false);
      toast({
        title: "Secure Connection Required",
        description: "Please access this site using HTTPS to enable location verification.",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsChecking(false);
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    // Detect iOS for specific guidance
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const attemptGeolocation = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          const distance = calculateDistance(
            latitude,
            longitude,
            allowedArea.lat,
            allowedArea.lng
          );

          const isWithinArea = distance <= allowedArea.radius;

          setIsChecking(false);
          onVerified(isWithinArea);

          if (isWithinArea) {
            toast({
              title: "Location Verified",
              description: `You are within the ${allowedArea.name}. You can now vote.`,
            });
          } else {
            toast({
              title: "Location Not Authorized",
              description: `You are ${distance.toFixed(1)}km from the voting area (max: ${allowedArea.radius}km).`,
              variant: "destructive",
            });
          }
        },
        (error) => {
          // If high accuracy failed, try again without it
          if (highAccuracy && error.code !== error.PERMISSION_DENIED) {
            console.log("High accuracy failed, retrying with standard accuracy...");
            attemptGeolocation(false);
            return;
          }

          setIsChecking(false);
          let errorMessage = "Unable to retrieve your location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = isIOS
                ? "Location permission denied. Please go to Settings → Safari → Location Services to enable."
                : "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable. Please ensure GPS is enabled and you have a clear view of the sky.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please check your connection and try again.";
              break;
          }

          setLocationError(errorMessage);
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: 30000, // Increased to 30s for mobile
          maximumAge: highAccuracy ? 0 : 60000, // Allow 1min cache for low accuracy
        }
      );
    };

    // Start with high accuracy
    attemptGeolocation(true);
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
