import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Vote, Users, TrendingUp, Clock, Trophy } from "lucide-react";
import { web3Service } from "@/services/web3Service";
import { apiService } from "@/services/apiService";

interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
  color: string;
}

export const AdminResults = () => {
  const [electionsWithResults, setElectionsWithResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllElectionResults();
    // Refresh every 3 seconds for live updates
    const interval = setInterval(loadAllElectionResults, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadAllElectionResults = async () => {
    try {
      const elections = await apiService.getAllElections();
      const relevantElections = elections.filter((e: any) =>
        e.status === "active" || e.status === "ended"
      );

      if (relevantElections.length === 0) {
        setElectionsWithResults([]);
        setLoading(false);
        return;
      }

      const electionsWithVotes = await Promise.all(
        relevantElections.map(async (election: any) => {
          let voteCounts: number[] = [];
          const electionIdToUse = election.blockchainElectionId;

          if (electionIdToUse) {
            try {
              voteCounts = await web3Service.getVotes(electionIdToUse);
            } catch (error) {
              console.error(`Error fetching votes for election ${election.name}:`, error);
              voteCounts = new Array(election.candidates.length).fill(0);
            }
          } else {

            voteCounts = new Array(election.candidates.length).fill(0);
          }

          const candidatesWithVotes: Candidate[] = election.candidates.map((candidate: any, index: number) => ({
            id: String(index),
            name: candidate.name || candidate,
            party: candidate.party || "Independent",
            votes: voteCounts[index] || 0,
            color: `hsl(${120 + index * 40}, ${60 + index * 5}%, 45%)`,
          }));

          const totalVotes = voteCounts.reduce((sum: number, count: number) => sum + count, 0);

          return {
            ...election,
            candidates: candidatesWithVotes,
            totalVotes,
          };
        })
      );

      setElectionsWithResults(electionsWithVotes);
      setLoading(false);
    } catch (error) {
      console.error('Error loading election results:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading election results...</p>
        </div>
      </div>
    );
  }

  if (electionsWithResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="glass p-8 border-primary/20 text-center">
          <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Elections</h3>
          <p className="text-muted-foreground">
            There are no active or ended elections to display results for.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase">Live Election Results</h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm font-semibold">Auto-refresh: 3s</span>
        </div>
      </div>

      {electionsWithResults.map((election) => {
        const sortedCandidates = [...election.candidates].sort((a: Candidate, b: Candidate) => b.votes - a.votes);

        const stats = [
          { label: "Total Votes", value: election.totalVotes.toLocaleString(), icon: Vote },
          { label: "Candidates", value: election.candidates.length.toString(), icon: Users },
          { label: "Leading", value: sortedCandidates[0]?.name || "N/A", icon: Trophy },
          { label: "Status", value: election.status, icon: Clock },
        ];

        return (
          <div key={election.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{election.name}</h3>
                <p className="text-sm text-muted-foreground">{election.description}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${election.status === 'active'
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
                }`}>
                {election.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="glass p-6 border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-black truncate">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass p-6 border-primary/20">
                <h3 className="text-lg font-bold mb-6">Vote Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={election.candidates} layout="vertical">
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          color: "hsl(var(--foreground))",
                        }}
                        itemStyle={{ color: "hsl(var(--primary))" }}
                        formatter={(value: number) => [value.toLocaleString(), "Votes"]}
                      />
                      <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                        {election.candidates.map((entry: Candidate, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="glass p-6 border-primary/20">
                <h3 className="text-lg font-bold mb-6">Candidate Standings</h3>
                <div className="space-y-4">
                  {sortedCandidates.map((candidate: Candidate, index: number) => {
                    const percentage = election.totalVotes > 0 ? ((candidate.votes / election.totalVotes) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={candidate.id} className="p-4 rounded-xl bg-background/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                              }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-bold">{candidate.name}</p>
                              <p className="text-xs text-muted-foreground">{candidate.party}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg">{candidate.votes.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{percentage}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: candidate.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
};
