import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, Globe, Crosshair, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";

interface GeofenceConfig {
  lat: number;
  lng: number;
  radius: number;
  name: string;
  enabled: boolean;
}

export const GeofencingManager = () => {
  const [config, setConfig] = useState<GeofenceConfig>({
    lat: 0,
    lng: 0,
    radius: 50,
    name: "Voting Zone",
    enabled: false,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await apiService.getGeofenceConfig();
        setConfig(savedConfig);
      } catch (error) {
        console.error("Failed to load geofence config:", error);
        toast({
          title: "Warning",
          description: "Could not load saved config. Using defaults.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiService.saveGeofenceConfig(config);
      toast({ title: "Geofencing Saved", description: "Configuration saved to server. All users will now use these settings." });
    } catch (error) {
      console.error("Failed to save geofence config:", error);
      toast({
        title: "Save Failed",
        description: "Could not save to server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation not supported", variant: "destructive" });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setConfig({
          ...config,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
        toast({ title: "Location Set", description: "Current location has been set as center point." });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({ title: "Error", description: "Unable to get location", variant: "destructive" });
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase">Geofencing Configuration</h2>
      </div>

      <Card className="glass p-8 border-primary/20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Location Restrictions</h3>
            <p className="text-muted-foreground">Define the allowed voting area for voters</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
            <div>
              <Label className="text-base font-semibold">Enable Geofencing</Label>
              <p className="text-sm text-muted-foreground">Restrict voting to specific locations</p>
            </div>
            <Button
              variant={config.enabled ? "hero" : "outline"}
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            >
              {config.enabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Zone Name */}
          <div className="space-y-2">
            <Label>Zone Name</Label>
            <Input
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="e.g., City Hall Voting Area"
              className="h-12 bg-background/50"
            />
          </div>

          {/* Coordinates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Center Latitude</Label>
              <Input
                type="number"
                step="any"
                value={config.lat}
                onChange={(e) => setConfig({ ...config, lat: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 40.7128"
                className="h-12 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Center Longitude</Label>
              <Input
                type="number"
                step="any"
                value={config.lng}
                onChange={(e) => setConfig({ ...config, lng: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., -74.0060"
                className="h-12 bg-background/50"
              />
            </div>
          </div>

          {/* Get Current Location Button */}
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full"
          >
            {isGettingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4" />
                Use Current Location as Center
              </>
            )}
          </Button>

          {/* Radius */}
          <div className="space-y-2">
            <Label>Radius (kilometers)</Label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={config.radius}
              onChange={(e) => setConfig({ ...config, radius: parseFloat(e.target.value) || 1 })}
              placeholder="e.g., 10"
              className="h-12 bg-background/50"
            />
            <p className="text-sm text-muted-foreground">
              Voters must be within {config.radius} km of the center point
            </p>
          </div>

          {/* Preview */}
          <Card className="p-6 bg-background/50 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-semibold">Configuration Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 font-medium ${config.enabled ? "text-primary" : "text-muted-foreground"}`}>
                  {config.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Zone:</span>
                <span className="ml-2 font-medium">{config.name || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Center:</span>
                <span className="ml-2 font-medium">{config.lat.toFixed(4)}, {config.lng.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Radius:</span>
                <span className="ml-2 font-medium">{config.radius} km</span>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button variant="hero" size="lg" onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
