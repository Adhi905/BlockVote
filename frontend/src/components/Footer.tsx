import { Vote, Github, Twitter, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-primary/10 py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-black gradient-text text-xl">BLOCKVOTE</span>
              <p className="text-xs text-muted-foreground">Decentralized Voting</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            © 2024 BlockVote. Empowering transparent democracy through blockchain.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Globe className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
