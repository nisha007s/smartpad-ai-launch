import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { AboutSection } from "@/components/AboutSection";
import { AuthSection } from "@/components/AuthSection";
import { Footer } from "@/components/Footer";
import { DashboardSection } from "@/components/DashboardSection";

const Index = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <FeaturesSection />
          <DashboardSection />
          <AboutSection />
          <AuthSection />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;
