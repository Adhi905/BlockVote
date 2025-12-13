import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, Clock, Play, Square, Trash2, Users, X, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";

interface Candidate {
  name: string;
  party: string;
}

interface Election {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "upcoming" | "active" | "ended";
  candidates: Candidate[];
}

interface ElectionManagerProps {
  onConfigureGeofencing?: () => void;
}

export const ElectionManager = ({ onConfigureGeofencing }: ElectionManagerProps) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [candidates, setCandidates] = useState<Candidate[]>([{ name: "", party: "" }, { name: "", party: "" }]);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const electionsData = await apiService.getAllElections();
      setElections(electionsData);
    } catch (error) {
      console.error('Error loading elections:', error);
      toast({
        title: "Failed to Load Elections",
        description: "Could not fetch elections from database.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: "active" | "ended") => {
    try {
      // Update election status via backend API
      await apiService.updateElectionStatus(id, newStatus);

      // Reload elections from database
      await loadElections();

      toast({
        title: newStatus === "active" ? "Election Started" : "Election Ended",
        description: `The election status has been updated to ${newStatus}.`
      });
    } catch (error: any) {
      toast({
        title: "Failed to Update Status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete election via backend API
      await apiService.deleteElection(id);

      // Reload elections from database
      await loadElections();

      toast({
        title: "Election Deleted",
        description: "The election has been removed successfully."
      });
    } catch (error: any) {
      toast({
        title: "Failed to Delete Election",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Validate candidates
      const validCandidates = candidates.filter(c => c.name.trim() !== "");

      if (validCandidates.length < 2) {
        toast({
          title: "Invalid Candidates",
          description: "At least 2 candidates with names are required.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      // Calculate duration in seconds
      const startTime = new Date(formData.startTime).getTime();
      const endTime = new Date(formData.endTime).getTime();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      // Create election via backend API (MongoDB) - single call with all data
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:6001'}/election/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('blockvote_token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          candidates: validCandidates,
          durationSeconds
        })
      });

      // Reload elections from database
      await loadElections();

      setFormData({ name: "", description: "", startTime: "", endTime: "" });
      setCandidates([{ name: "", party: "" }, { name: "", party: "" }]);
      setShowForm(false);

      toast({
        title: "Election Created",
        description: `${formData.name} has been created successfully in MongoDB.`
      });
    } catch (error: any) {
      console.error('Error creating election:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-primary bg-primary/20";
      case "upcoming": return "text-accent bg-accent/20";
      case "ended": return "text-muted-foreground bg-muted";
      default: return "";
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase">Manage Elections</h2>
        <Button variant="hero" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-5 h-5" />
          Create Election
        </Button>
      </div>

      {/* Geofencing Shortcut */}
      {onConfigureGeofencing && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Geofencing Configuration</h4>
              <p className="text-xs text-muted-foreground">Restrict voting to specific locations.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onConfigureGeofencing} className="btn-hover-glow">
            Configure Geofencing
          </Button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="glass p-8 border-primary/20">
          <h3 className="text-xl font-bold mb-6">New Election</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Election Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Presidential Election 2024"
                  required
                  className="h-12 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="h-12 bg-background/50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="h-12 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="h-12 bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Candidates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCandidates([...candidates, { name: "", party: "" }])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </div>

              {candidates.map((candidate, index) => (
                <Card key={index} className="p-4 bg-background/30">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <Label>Candidate {index + 1} Name</Label>
                      <Input
                        value={candidate.name}
                        onChange={(e) => {
                          const newCandidates = [...candidates];
                          newCandidates[index].name = e.target.value;
                          setCandidates(newCandidates);
                        }}
                        placeholder="Enter candidate name"
                        required
                        className="h-10 bg-background/50"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Party</Label>
                      <Input
                        value={candidate.party}
                        onChange={(e) => {
                          const newCandidates = [...candidates];
                          newCandidates[index].party = e.target.value;
                          setCandidates(newCandidates);
                        }}
                        placeholder="Enter party name"
                        className="h-10 bg-background/50"
                      />
                    </div>
                    {candidates.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCandidates = candidates.filter((_, i) => i !== index);
                          setCandidates(newCandidates);
                        }}
                        className="mt-7 text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="hero" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Creating in MongoDB...
                  </>
                ) : (
                  "Create Election"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={isCreating}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Elections List */}
      <div className="grid gap-6">
        {elections.length === 0 ? (
          <Card className="glass p-12 text-center border-border/50">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No Elections Yet</h3>
            <p className="text-muted-foreground">Create your first election to get started.</p>
          </Card>
        ) : (
          elections.map((election) => (
            <Card key={election.id} className="glass p-6 border-primary/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{election.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(election.status)}`}>
                      {election.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">{election.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{election.candidates.length} Candidates</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {election.status === "upcoming" && (
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => handleStatusChange(election.id, "active")}
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </Button>
                  )}
                  {election.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(election.id, "ended")}
                    >
                      <Square className="w-4 h-4" />
                      End
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(election.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
