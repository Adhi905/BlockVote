import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Vote, LogOut, Plus, MapPin, Clock, BarChart3, Settings, Users } from "lucide-react";
import { ElectionManager } from "@/components/admin/ElectionManager";
import { GeofencingManager } from "@/components/admin/GeofencingManager";
import { AdminResults } from "@/components/admin/AdminResults";
import { toast } from "@/hooks/use-toast";

type AdminTab = "elections" | "geofencing" | "results";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("elections");

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "You have been logged out." });
    navigate("/auth");
  };

  const tabs = [
    { id: "elections" as AdminTab, label: "Elections", icon: Plus },
    { id: "geofencing" as AdminTab, label: "Geofencing", icon: MapPin },
    { id: "results" as AdminTab, label: "Live Results", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.png"
                alt="BlockVote Logo"
                className="w-12 h-12 rounded-xl glow-primary object-contain bg-background/50"
              />
              <div>
                <span className="text-xl font-black tracking-tight">BLOCKVOTE</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase">
                  Admin
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tight">
              Admin <span className="gradient-text text-glow">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Manage elections, configure geofencing, and monitor live results.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "hero" : "ghost"}
                size="lg"
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-6xl mx-auto">
            {activeTab === "elections" && <ElectionManager onConfigureGeofencing={() => setActiveTab("geofencing")} />}
            {activeTab === "geofencing" && <GeofencingManager />}
            {activeTab === "results" && <AdminResults />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          BlockVote Admin Panel • Secure Election Management
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
