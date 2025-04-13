import React from 'react';
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-sm shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-padding flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-gradient-to-r from-smartpad-blue to-smartpad-violet p-1 text-white">
              <span className="text-xl font-bold">S</span>
            </div>
            <span className="font-semibold text-xl hidden sm:block">SmartPad</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-smartpad-blue">
              Features
            </a>
            <a href="#about" className="text-sm font-medium hover:text-smartpad-blue">
              About
            </a>
            <Link to="/app" className="text-sm font-medium hover:text-smartpad-blue">
              App
            </Link>
            <a href="#pricing" className="text-sm font-medium hover:text-smartpad-blue">
              Pricing
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button 
            variant="outline" 
            className="hidden md:inline-flex"
            asChild
          >
            <Link to="/app">Try Free</Link>
          </Button>
          <Button 
            className="hidden md:inline-flex bg-smartpad-blue hover:bg-smartpad-blue/90"
          >
            Sign Up
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <nav className="flex flex-col p-4 gap-4">
            <a 
              href="#features" 
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#about" 
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <Link 
              to="/app" 
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              App
            </Link>
            <a 
              href="#pricing" 
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="border-t pt-4 mt-2 flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                asChild
              >
                <Link to="/app" onClick={() => setMobileMenuOpen(false)}>Try Free</Link>
              </Button>
              <Button 
                className="w-full justify-start bg-smartpad-blue hover:bg-smartpad-blue/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
