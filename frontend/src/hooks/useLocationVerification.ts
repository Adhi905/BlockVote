import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AllowedArea {
    lat: number;
    lng: number;
    radius: number; // in km
    name: string;
}

const DEFAULT_ALLOWED_AREA = {
    lat: 0,
    lng: 0,
    radius: 50000,
    name: "Authorized Voting Zone",
};

export const useLocationVerification = (allowedArea: AllowedArea = DEFAULT_ALLOWED_AREA) => {
    const [isVerifying, setIsVerifying] = useState(false);
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

    const verifyLocation = (): Promise<boolean> => {
        return new Promise((resolve) => {
            setIsVerifying(true);
            setLocationError(null);

            // Check for Secure Context (HTTPS)
            if (!window.isSecureContext) {
                const error = "Geolocation requires secure connection (HTTPS). Please access the site via HTTPS.";
                setLocationError(error);
                setIsVerifying(false);
                toast({
                    title: "Secure Connection Required",
                    description: "Please access this site using HTTPS to enable location verification.",
                    variant: "destructive",
                });
                resolve(false);
                return;
            }

            if (!navigator.geolocation) {
                const error = "Geolocation is not supported by your browser";
                setLocationError(error);
                setIsVerifying(false);
                toast({
                    title: "Location Error",
                    description: error,
                    variant: "destructive",
                });
                resolve(false);
                return;
            }

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

                        setIsVerifying(false);

                        if (isWithinArea) {
                            // Only toast on success if checks are being run manually, 
                            // but we return the value regardless
                        } else {
                            toast({
                                title: "Location Not Authorized",
                                description: `You are ${distance.toFixed(1)}km from the voting area (max: ${allowedArea.radius}km).`,
                                variant: "destructive",
                            });
                        }

                        resolve(isWithinArea);
                    },
                    (error) => {
                        if (highAccuracy && error.code !== error.PERMISSION_DENIED) {
                            console.log("High accuracy failed, retrying with standard accuracy...");
                            attemptGeolocation(false);
                            return;
                        }

                        setIsVerifying(false);
                        let errorMessage = "Unable to retrieve your location";

                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = isIOS
                                    ? "Location permission denied. Please go to Settings → Safari → Location Services to enable."
                                    : "Location permission denied. Please enable location access in your browser settings.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = "Location information unavailable. Please ensure GPS is enabled.";
                                break;
                            case error.TIMEOUT:
                                errorMessage = "Location request timed out. Please check your connection.";
                                break;
                        }

                        setLocationError(errorMessage);
                        toast({
                            title: "Location Error",
                            description: errorMessage,
                            variant: "destructive",
                        });
                        resolve(false);
                    },
                    {
                        enableHighAccuracy: highAccuracy,
                        timeout: 30000,
                        maximumAge: 0, // Force fresh location check every time
                    }
                );
            };

            attemptGeolocation(true);
        });
    };

    return {
        verifyLocation,
        isVerifying,
        locationError,
        userLocation,
        setLocationError
    };
};
