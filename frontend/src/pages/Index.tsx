import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { ReleaseCalendar } from "@/components/ReleaseCalendar";
import { ContentCalendar } from "@/components/ContentCalendar";
import { RoyaltyDashboard } from "@/components/RoyaltyDashboard";
import { Fans } from "@/components/Fans";
import { Create } from "@/components/Create";
import { Community } from "@/components/Community";
import { Settings } from "@/components/Settings";
import { MetadataPrep } from "@/components/MetadataPrep";
import { Onboarding } from "@/components/Onboarding";
import { UserProfile } from "@/components/auth/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "releases":
        return <ReleaseCalendar />;
      case "content":
        return <ContentCalendar />;
      case "royalties":
        return <RoyaltyDashboard />;
      case "fans":
        return <Fans />;
      case "community":
        return <Community />;
      case "create":
        return <Create />;
      case "pitch":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">DSP Pitch Tool</h2>
            <p className="text-muted-foreground mb-6">Coming soon - One-click playlist pitching to Spotify, Apple Music & more</p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="default" 
                onClick={() => window.open('https://artists.spotify.com/c/music', '_blank')}
              >
                Spotify
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://artists.apple.com/', '_blank')}
              >
                Apple Music
              </Button>
            </div>
          </div>
        );
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Onboarding view
  if (showOnboarding) {
    return <Onboarding onComplete={() => {
      setShowOnboarding(false);
      setActiveSection("dashboard");
    }} />;
  }

  // Landing page view
  if (!activeSection) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
                All Access Artist
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Giving you all access to build a career you're proud of.
              </p>
            </div>
            
            <div className="pt-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-elegant hover:shadow-glow transition-all duration-300"
                onClick={() => setShowOnboarding(true)}
              >
                Let's Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="ml-64 p-8">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default Index;