import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthSection() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section id="auth" className="py-20 container-padding">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started</h2>
          <p className="text-muted-foreground">
            Create an account or try the demo to experience SmartPad
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Log In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-smartpad-blue hover:bg-smartpad-blue/90">
                  Create Account
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background dark:bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-smartpad-blue hover:bg-smartpad-blue/90">
                  Log In
                </Button>
                
                <div className="text-center">
                  <Button variant="link" className="text-smartpad-blue">
                    Forgot password?
                  </Button>
                </div>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background dark:bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t border-border text-center">
            <Button 
              variant="ghost" 
              className="text-sm text-muted-foreground hover:text-smartpad-blue"
              asChild
            >
              <Link to="/app">Continue as Guest</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
