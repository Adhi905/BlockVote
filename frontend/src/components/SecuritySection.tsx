import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, FileCheck, Fingerprint, Server } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Smart Contract Audited",
    description: "All voting logic is handled by audited smart contracts, ensuring tamper-proof execution.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Proofs",
    description: "Your vote remains private while still being verifiable on the blockchain.",
  },
  {
    icon: Eye,
    title: "Public Auditability",
    description: "Anyone can verify the election results without compromising voter privacy.",
  },
  {
    icon: FileCheck,
    title: "Immutable Records",
    description: "Once cast, votes are permanently recorded and cannot be altered or deleted.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Verification",
    description: "Optional biometric authentication adds an extra layer of identity verification.",
  },
  {
    icon: Server,
    title: "Decentralized Network",
    description: "No single point of failure ensures the system remains operational and secure.",
  },
];

export const SecuritySection = () => {
  return (
    <section id="security" className="py-32 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 uppercase tracking-tight">
            Enterprise-Grade <span className="gradient-text text-glow">Security</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Built with cutting-edge cryptographic protocols to ensure the highest level of security and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="feature"
              className="animate-fade-in p-8"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-black mb-3 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
