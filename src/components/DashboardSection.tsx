import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, List, ListOrdered, AlignLeft, Star, Users, FileText, CheckSquare, Mic } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function DashboardSection() {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <section className="py-20 container-padding bg-gradient-to-b from-muted/50 to-background">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience SmartPad</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          A modern, AI-powered note-taking experience
        </p>
        <Button 
          className="bg-smartpad-blue hover:bg-smartpad-blue/90 active:bg-smartpad-blue/80 transition-colors shadow-sm hover:shadow"
          asChild
        >
          <Link to="/app">Try it yourself</Link>
        </Button>
      </div>
      
      <div className="dashboard-container max-w-6xl">
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-r bg-muted/20 p-4">
            <nav className="space-y-4">
              <div 
                className={`dashboard-sidebar-item ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Notes</span>
              </div>
              
              <div 
                className={`dashboard-sidebar-item ${activeTab === "tasks" ? "active" : ""}`}
                onClick={() => setActiveTab("tasks")}
              >
                <CheckSquare className="h-5 w-5" />
                <span className="font-medium">Tasks</span>
              </div>
              
              <div 
                className={`dashboard-sidebar-item ${activeTab === "favorites" ? "active" : ""}`}
                onClick={() => setActiveTab("favorites")}
              >
                <Star className="h-5 w-5" />
                <span className="font-medium">Favorites</span>
              </div>
              
              <div 
                className={`dashboard-sidebar-item ${activeTab === "collaboration" ? "active" : ""}`}
                onClick={() => setActiveTab("collaboration")}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Collaboration</span>
              </div>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-4">Welcome to Notepad X</h1>
              <p className="text-xl text-muted-foreground mb-6">Start writing here...</p>
              
              <div className="border rounded-lg mb-4 bg-background shadow-sm">
                <div className="editor-toolbar">
                  <Button variant="ghost" size="icon" className="h-8 w-8 transition-colors hover:bg-muted/50 active:bg-muted/70">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 transition-colors hover:bg-muted/50 active:bg-muted/70">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 transition-colors hover:bg-muted/50 active:bg-muted/70">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 transition-colors hover:bg-muted/50 active:bg-muted/70">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 transition-colors hover:bg-muted/50 active:bg-muted/70">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 min-h-[200px]"></div>
              </div>
            </div>
          </div>
          
          {/* Suggestions Panel */}
          <div className="w-full md:w-80 border-l bg-muted/10 p-4">
            <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
            
            <div className="space-y-3">
              <div className="suggestion-card">
                <div className="flex items-start gap-3">
                  <div className="bg-smartpad-blue/10 rounded p-1">
                    <FileText className="h-4 w-4 text-smartpad-blue" />
                  </div>
                  <span className="text-sm font-medium">Create task from meeting</span>
                </div>
              </div>
              
              <div className="suggestion-card">
                <div className="flex items-start gap-3">
                  <div className="bg-smartpad-blue/10 rounded p-1">
                    <CheckSquare className="h-4 w-4 text-smartpad-blue" />
                  </div>
                  <span className="text-sm font-medium">Categorize under Suggestions</span>
                </div>
              </div>
              
              <div className="suggestion-card">
                <div className="flex items-start gap-3">
                  <div className="bg-smartpad-blue/10 rounded p-1">
                    <List className="h-4 w-4 text-smartpad-blue" />
                  </div>
                  <span className="text-sm font-medium">Notes created in last week</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center md:mt-auto">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-12 w-12 border-2 shadow-md hover:bg-smartpad-blue/10 hover:border-smartpad-blue active:bg-smartpad-blue/20 transition-all duration-300"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 