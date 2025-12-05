import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, Vote, Clock, TrendingUp } from "lucide-react";

const candidates = [
  { name: "A. Chen", fullName: "Alexandra Chen", votes: 45234, color: "hsl(142, 76%, 45%)" },
  { name: "M. Johnson", fullName: "Marcus Johnson", votes: 38912, color: "hsl(160, 100%, 40%)" },
  { name: "S. Williams", fullName: "Sarah Williams", votes: 32456, color: "hsl(180, 70%, 45%)" },
  { name: "D. Park", fullName: "David Park", votes: 28103, color: "hsl(120, 60%, 50%)" },
];

const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

const stats = [
  { label: "Total Votes", value: totalVotes.toLocaleString(), icon: Vote, color: "text-primary" },
  { label: "Registered Voters", value: "185,420", icon: Users, color: "text-primary" },
  { label: "Turnout Rate", value: "78.4%", icon: TrendingUp, color: "text-primary" },
  { label: "Time Remaining", value: "2d 14h", icon: Clock, color: "text-primary" },
];

export const ResultsSection = () => {
  return (
    <section id="results" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tight">
            Live <span className="gradient-text text-glow">Results</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Real-time voting results updated directly from the blockchain. All votes are publicly verifiable.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <Card key={stat.label} variant="stats" className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar chart */}
          <Card variant="glass" className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-wide">Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={candidates} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--primary) / 0.2)",
                        borderRadius: "16px",
                      }}
                      itemStyle={{ color: "hsl(var(--primary))" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [value.toLocaleString(), "Votes"]}
                    />
                    <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                      {candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card variant="glass" className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-wide">Current Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidates
                  .sort((a, b) => b.votes - a.votes)
                  .map((candidate, index) => {
                    const percentage = ((candidate.votes / totalVotes) * 100).toFixed(1);
                    return (
                      <div key={candidate.name} className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <span
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                              style={{ backgroundColor: `${candidate.color}30`, color: candidate.color }}
                            >
                              #{index + 1}
                            </span>
                            <span className="font-bold">{candidate.fullName}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-lg">{percentage}%</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              ({candidate.votes.toLocaleString()})
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: candidate.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
