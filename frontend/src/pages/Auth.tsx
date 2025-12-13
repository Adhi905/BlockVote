import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, Shield } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast({ title: "Welcome back!", description: "Successfully logged in." });
          // Check if admin
          if (email === "admin@demo.com") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          toast({ title: "Login failed", description: result.error, variant: "destructive" });
        }
      } else {
        if (!name.trim()) {
          toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const result = await signup(email, password, name);
        if (result.success) {
          toast({ title: "Account created!", description: "Welcome to BlockVote." });
          navigate("/");
        } else {
          toast({ title: "Signup failed", description: result.error, variant: "destructive" });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary overflow-hidden">
              <img src="/favicon.png" alt="BlockVote Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight">BLOCKVOTE</span>
          </div>
          <p className="text-muted-foreground">Secure. Transparent. Decentralized.</p>
        </div>

        <Card className="glass p-4 sm:p-6 md:p-8 border-primary/20">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={isLogin ? "hero" : "ghost"}
              className="flex-1"
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? "hero" : "ghost"}
              className="flex-1"
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-12 bg-background/50 border-border/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-11 h-12 bg-background/50 border-border/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Login" : "Sign Up"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold">Demo Admin Access</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Email: admin@blockvote.com<br />
              Password: admin123
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
