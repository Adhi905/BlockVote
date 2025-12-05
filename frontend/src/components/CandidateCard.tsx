import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, User } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  votes: number;
  color: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
  hasVoted: boolean;
}

export const CandidateCard = ({ candidate, isSelected, onSelect, hasVoted }: CandidateCardProps) => {
  return (
    <Card
      variant="candidate"
      className={`relative overflow-hidden transition-all duration-300 ${
        isSelected ? "border-primary glow-primary scale-[1.02]" : ""
      } ${hasVoted ? "opacity-75" : ""}`}
      onClick={() => !hasVoted && onSelect(candidate.id)}
    >
      {/* Color accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
        style={{ backgroundColor: candidate.color }}
      />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardContent className="p-6 relative">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${candidate.color}30` }}
          >
            <User className="w-10 h-10" style={{ color: candidate.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black truncate uppercase tracking-tight">{candidate.name}</h3>
              {isSelected && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-scale-in glow-primary">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: candidate.color }}>{candidate.party}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{candidate.description}</p>
          </div>
        </div>

        {!hasVoted && (
          <Button 
            variant={isSelected ? "default" : "outline"} 
            className="w-full mt-6"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(candidate.id);
            }}
          >
            {isSelected ? "Selected" : "Select Candidate"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
