import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink, Copy, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
}

export const VoteConfirmation = ({ isOpen, onClose, candidateName }: VoteConfirmationProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-primary/20 max-w-md rounded-3xl">
        <div className="text-center py-8">
          {/* Success animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
            <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center animate-scale-in glow-primary">
              <Check className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-3xl font-black mb-3 uppercase">Vote Confirmed!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Vote registered to <span className="text-primary font-bold">{candidateName}</span>
          </p>

          <Button variant="default" className="w-full" size="lg" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
