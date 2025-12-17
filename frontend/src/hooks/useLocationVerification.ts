import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AllowedArea {
    lat: number;
    lng: number;
    radius: number; // in km
    name: string;
}

const DEFAULT_ALLOWED_AREA: AllowedArea = {
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
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const verifyLocation = (overrideAllowedArea?: AllowedArea): Promise<boolean> => {
        return new Promise((resolve) => {
            const targetArea = overrideAllowedArea || allowedArea;
            if (!navigator.geolocation) {
                const err = "Geolocation is not supported by your browser";
                setLocationError(err);
                toast({ title: "Location Error", description: err, variant: "destructive" });
                resolve(false);
                return;
            }
            setIsVerifying(true);
            setLocationError(null);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const attempt = (highAcc: boolean) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                        const distance = calculateDistance(latitude, longitude, targetArea.lat, targetArea.lng);
                        const within = distance <= targetArea.radius;
                        setIsVerifying(false);
                        if (!within) {
                            toast({
                                title: "Location Not Authorized",
                                description: `You are ${distance.toFixed(1)}km from the voting area (max: ${targetArea.radius}km).`,
                                variant: "destructive",
                            });
                        }
                        resolve(within);
                    },
                    (error) => {
                        if (highAcc && error.code !== error.PERMISSION_DENIED) {
                            attempt(false);
                            return;
                        }
                        let msg = "Unable to retrieve your location";
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                msg = isIOS
                                    ? "Location permission denied. Please enable in Settings → Safari → Location Services."
                                    : "Location permission denied. Please enable in browser settings.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                msg = "Location information unavailable. Ensure GPS is enabled.";
                                break;
                            case error.TIMEOUT:
                                msg = "Location request timed out. Check your connection.";
                                break;
                        }
                        setLocationError(msg);
                        toast({ title: "Location Error", description: msg, variant: "destructive" });
                        setIsVerifying(false);
                        resolve(false);
                    },
                    { enableHighAccuracy: highAcc, timeout: 30000, maximumAge: 0 }
                );
            };
            attempt(true);
        });
    };

    return {
        verifyLocation,
        isVerifying,
        locationError,
        userLocation,
        setLocationError,
    };
};
