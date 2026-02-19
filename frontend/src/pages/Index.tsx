import { lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { useNavigation } from "@/contexts/NavigationContext";
import { useProfile } from "@/hooks/api/useProfile";
import { DEFAULT_SECTION } from "@/lib/sectionRoutes";

const Dashboard = lazy(() => import("@/components/Dashboard").then((module) => ({ default: module.Dashboard })));
const AdminDashboard = lazy(() => import("@/components/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const ReleaseCalendar = lazy(() => import("@/components/ReleaseCalendar").then((module) => ({ default: module.ReleaseCalendar })));
const ContentCreator = lazy(() => import("@/components/ContentCreator").then((module) => ({ default: module.ContentCreator })));
const RoyaltyDashboard = lazy(() => import("@/components/RoyaltyDashboard").then((module) => ({ default: module.RoyaltyDashboard })));
const Fans = lazy(() => import("@/components/Fans").then((module) => ({ default: module.Fans })));
const Community = lazy(() => import("@/components/Community").then((module) => ({ default: module.Community })));
const Settings = lazy(() => import("@/components/Settings").then((module) => ({ default: module.Settings })));
const Onboarding = lazy(() => import("@/components/Onboarding").then((module) => ({ default: module.Onboarding })));

const Index = () => {
  const { activeSection, setActiveSection } = useNavigation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: userProfile } = useProfile();

  const renderSectionFallback = (label: string) => (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
      Loading {label}...
    </div>
  );

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
    return (
      <Suspense fallback={renderSectionFallback("onboarding")}>
        <Onboarding onComplete={() => {
          setShowOnboarding(false);
          setActiveSection(DEFAULT_SECTION);
        }} />
      </Suspense>
    );
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
    <AppShell>
      <Suspense fallback={renderSectionFallback("section")}>
        {renderActiveSection()}
      </Suspense>
    </AppShell>
  );
};

export default Index;