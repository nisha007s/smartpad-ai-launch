import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 container-padding">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative mb-6 inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-smartpad-blue/20 to-smartpad-violet/20 blur-3xl rounded-full"></div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold relative">
            Reimagining Notepad for the AI Era
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          <span className="font-medium">Simple.</span>{" "}
          <span className="font-medium text-smartpad-blue">Smart.</span>{" "}
          <span className="font-medium text-smartpad-violet">Collaborative.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-smartpad-blue hover:bg-smartpad-blue/90 active:bg-smartpad-blue/80 text-white shadow-sm hover:shadow transition-all"
          >
            Sign Up Free
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-smartpad-blue text-smartpad-blue hover:bg-smartpad-blue/10 active:bg-smartpad-blue/20 shadow-sm hover:shadow transition-all"
            asChild
          >
            <Link to="/app">Try Demo</Link>
          </Button>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10"></div>
          <div className="glass-card rounded-xl overflow-hidden shadow-2xl">
            <div className="relative bg-slate-900 p-2 flex items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 text-xs text-gray-300">SmartPad</div>
            </div>
            <div className="h-64 sm:h-80 bg-white dark:bg-gray-800 p-6 text-left">
              <div className="typing-animation text-lg font-mono">
                # Welcome to SmartPad
                
                Your thoughts, organized, enhanced, and intelligent.
                
                Start typing and let AI do the rest...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
