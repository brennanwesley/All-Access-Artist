import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/components/auth/UserProfile";
import { useNavigation } from "@/contexts/NavigationContext";
import { sectionFromPath, type SectionId } from "@/lib/sectionRoutes";
import type { LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

import { 
  Calendar, 
  Video, 
  DollarSign, 
  Settings,
  Home,
  Users
} from "lucide-react";

export const Navigation = () => {
  const navigation = useNavigation()
  const location = useLocation()

  const activeSection = sectionFromPath(location.pathname)
  const handleSectionChange = (section: SectionId) => {
    // Prevent redundant navigation calls
    if (section !== activeSection) {
      navigation.navigateToSection(section);
    }
  }

  const navItems: Array<{ id: SectionId; label: string; icon: LucideIcon }> = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "releases", label: "Releases", icon: Calendar },
    { id: "content", label: "Content Creator", icon: Video },
    { id: "fans", label: "Fans", icon: Users },
    { id: "community", label: "Community", icon: Users },
    { id: "royalties", label: "Royalties", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="bg-card/50 backdrop-blur-sm border-r border-border h-screen w-64 p-6 fixed left-0 top-0 z-40 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          All Access Artist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">giving you all access to build a career you're proud of</p>
      </div>
      
      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                isActive ? "shadow-elegant" : "hover:bg-secondary/50"
              }`}
              onClick={() => handleSectionChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
              {(item.id === "fans" || item.id === "community" || item.id === "royalties") && (
                <Badge variant="outline" className="ml-0.5 text-xs px-2 py-0.5 text-muted-foreground border-muted-foreground/30">
                  Coming Soon
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* User Profile at bottom */}
      <div className="mt-auto pt-4">
        <UserProfile />
      </div>
    </nav>
  );
};