import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { Onboarding } from "@/components/Onboarding";
import { useNavigation } from "@/contexts/NavigationContext";

const Index = () => {
  const location = useLocation();
  const navigation = useNavigation();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Handle navigation state from route transitions
  useEffect(() => {
    console.log('Index: useEffect triggered with location.state:', location.state);
    console.log('Index: Current activeSection:', navigation.activeSection);
    
    if (location.state?.activeSection) {
      console.log('Index: Setting activeSection from route state to:', location.state.activeSection);
      navigation.setActiveSection(location.state.activeSection);
    } else if (!navigation.activeSection) {
      // If no activeSection is set, default to dashboard
      console.log('Index: No activeSection set, defaulting to dashboard');
      navigation.setActiveSection('dashboard');
    }
  }, [location.state, navigation]);

  const renderActiveSection = () => {
    console.log('Index: renderActiveSection called with activeSection:', navigation.activeSection);
    
    switch (navigation.activeSection) {
      case "dashboard":
        console.log('Index: Rendering Dashboard');
        return <Dashboard />;
      case "releases":
        console.log('Index: Rendering ReleaseCalendar');
        return <ReleaseCalendar />;
      case "content":
        console.log('Index: Rendering ContentCalendar');
        return <ContentCalendar />;
      case "royalties":
        console.log('Index: Rendering RoyaltyDashboard');
        return <RoyaltyDashboard />;
      case "fans":
        console.log('Index: Rendering Fans');
        return <Fans />;
      case "community":
        console.log('Index: Rendering Community');
        return <Community />;
      case "create":
        console.log('Index: Rendering Create');
        return <Create />;
      case "pitch":
        console.log('Index: Rendering DSP Pitch Tool');
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
        console.log('Index: Rendering Settings');
        return <Settings />;
      default:
        console.log('Index: Default case - rendering Dashboard for activeSection:', navigation.activeSection);
        return <Dashboard />;
    }
  };

  // Onboarding view
  if (showOnboarding) {
    return <Onboarding onComplete={() => {
      setShowOnboarding(false);
      navigation.setActiveSection("dashboard");
    }} />;
  }

  // Landing page view - only show if activeSection is explicitly null/undefined AND not coming from route state
  if (!navigation.activeSection && !location.state?.activeSection) {
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
      <Navigation />
      <main className="ml-64 p-8">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default Index;