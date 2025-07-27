import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { ReleaseCalendar } from "@/components/ReleaseCalendar";
import { ContentCalendar } from "@/components/ContentCalendar";
import { RoyaltyDashboard } from "@/components/RoyaltyDashboard";
import { Fans } from "@/components/Fans";
import { Create } from "@/components/Create";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

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
      case "create":
        return <Create />;
      case "metadata":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Metadata Prep Tool</h2>
            <p className="text-muted-foreground">Coming soon - Streamline your track metadata for all DSPs</p>
          </div>
        );
      case "pitch":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">DSP Pitch Tool</h2>
            <p className="text-muted-foreground">Coming soon - One-click playlist pitching to Spotify, Apple Music & more</p>
          </div>
        );
      case "analytics":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
            <p className="text-muted-foreground">Coming soon - Deep insights into your music performance</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Coming soon - Customize your All Access Artist experience</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

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