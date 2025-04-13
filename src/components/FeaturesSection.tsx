
import { Brain, FolderCog, Users } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="feature-card flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-full bg-smartpad-blue/10 dark:bg-smartpad-blue/20 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 container-padding">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enjoy a seamless writing experience enhanced with cutting-edge AI capabilities
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Brain className="h-8 w-8 text-smartpad-blue" />}
          title="AI-Powered Suggestions"
          description="Get real-time writing assistance and content organization with our advanced AI"
        />
        
        <FeatureCard
          icon={<FolderCog className="h-8 w-8 text-smartpad-blue" />}
          title="Smart Categorization"
          description="Automatically sort notes by type (ideas, to-dos, meetings) and keep everything organized"
        />
        
        <FeatureCard
          icon={<Users className="h-8 w-8 text-smartpad-blue" />}
          title="Collaborate in Real-Time"
          description="Share and co-edit notes with teammates live, making team collaboration seamless"
        />
      </div>
    </section>
  );
}
