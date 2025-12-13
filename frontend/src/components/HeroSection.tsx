import { Button } from "@/components/ui/button";
import { Shield, Lock, Globe, ChevronDown, Zap } from "lucide-react";

interface HeroSectionProps {
  onStartVoting: () => void;
}

export const HeroSection = ({ onStartVoting }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[150px] animate-float animate-glow-rotate" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-8 animate-fade-in border-primary/20">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Powered by Blockchain</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 animate-fade-in leading-tight" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">THE FUTURE OF</span>
            <span className="block gradient-text text-glow">VOTING</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in font-medium" style={{ animationDelay: "0.2s" }}>
            Cast your vote with complete transparency and security. Every vote is immutably recorded on the blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" onClick={onStartVoting}>
              Start Voting Now
            </Button>
            <Button variant="outline" size="xl">
              How It Works
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="glass p-8 rounded-2xl border-primary/10 hover:border-primary/30 transition-all hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-black text-base sm:text-lg mb-2 uppercase tracking-wide">End-to-End Encrypted</h3>
              <p className="text-muted-foreground text-sm">Your vote is encrypted and only you hold the key</p>
            </div>
            <div className="glass p-8 rounded-2xl border-primary/10 hover:border-primary/30 transition-all hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-black text-base sm:text-lg mb-2 uppercase tracking-wide">Fully Decentralized</h3>
              <p className="text-muted-foreground text-sm">No single point of failure or control</p>
            </div>
            <div className="glass p-8 rounded-2xl border-primary/10 hover:border-primary/30 transition-all hover:scale-105">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-black text-base sm:text-lg mb-2 uppercase tracking-wide">Immutable Records</h3>
              <p className="text-muted-foreground text-sm">Once recorded, votes cannot be altered</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary" />
        </div>
      </div>
    </section>
  );
};
