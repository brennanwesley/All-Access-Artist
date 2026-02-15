import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ReleaseCalendar } from "@/components/ReleaseCalendar";
import { ContentCreator } from "@/components/ContentCreator";
import { RoyaltyDashboard } from "@/components/RoyaltyDashboard";
import { Fans } from "@/components/Fans";
import { Community } from "@/components/Community";
import { Settings } from "@/components/Settings";
import { Onboarding } from "@/components/Onboarding";
import { useNavigation } from "@/contexts/NavigationContext";
import { useProfile } from "@/hooks/api/useProfile";

const Index = () => {
  const location = useLocation();
  const { activeSection, setActiveSection } = useNavigation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: userProfile } = useProfile();

  // Handle navigation state from route transitions
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
      // Clear the location state after processing to prevent re-processing
      window.history.replaceState({}, '', window.location.pathname);
    } else if (!activeSection) {
      // If no activeSection is set, default to dashboard
      setActiveSection('dashboard');
    }
  }, [location.state, activeSection, setActiveSection]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        // Route to AdminDashboard for admin users, regular Dashboard for others
        if (userProfile?.account_type === 'admin') {
          return <AdminDashboard />;
        }
        return <Dashboard />;
      case "releases":
        return <ReleaseCalendar />;
      case "content":
        return <ContentCreator />;
      case "royalties":
        return <RoyaltyDashboard />;
      case "fans":
        return <Fans />;
      case "community":
        return <Community />;
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
        // Default also respects account type
        if (userProfile?.account_type === 'admin') {
          return <AdminDashboard />;
        }
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

  // Landing page view - only show if activeSection is explicitly null/undefined AND not coming from route state
  if (!activeSection && !location.state?.activeSection) {
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="ml-64 min-h-screen bg-gradient-subtle">
        <div className="p-8">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;