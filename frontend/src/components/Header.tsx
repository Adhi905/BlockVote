import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Vote, Shield, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  isConnected: boolean;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header = ({ isConnected, walletAddress, onConnect, onDisconnect }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "You have been logged out." });
    navigate("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="BlockVote Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl glow-primary object-contain bg-background/50"
          />
          <div>
            <span className="text-lg sm:text-xl md:text-2xl font-black gradient-text tracking-tight">BLOCKVOTE</span>
            <p className="hidden sm:block text-xs text-muted-foreground font-medium tracking-widest uppercase">Decentralized Voting</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          <a href="#vote" className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-sm tracking-wider flex items-center gap-2">
            <Vote className="w-4 h-4" />
            Vote
          </a>
          <a href="#security" className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-sm tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </a>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* User Info */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          )}

          {/* Wallet Status */}
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="glass px-2 sm:px-3 md:px-4 py-2 rounded-xl flex items-center gap-2 sm:gap-3 border-primary/20">
                <div className="w-3 h-3 rounded-full bg-primary glow-primary" />
                <span className="text-xs sm:text-sm font-mono text-foreground font-bold">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-muted-foreground hidden sm:inline-flex">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button variant="wallet" onClick={onConnect} size="sm" className="text-xs sm:text-sm">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}

          {/* Logout */}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
