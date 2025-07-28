import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Music, 
  Video, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Home,
  BarChart3,
  Users,
  Palette
} from "lucide-react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "releases", label: "Release Calendar", icon: Calendar },
    { id: "metadata", label: "Metadata Prep", icon: Music },
    { id: "content", label: "Content Planner", icon: Video },
    { id: "pitch", label: "DSP Pitch Tool", icon: TrendingUp },
    { id: "fans", label: "Fans", icon: Users },
    { id: "create", label: "Create", icon: Palette },
    { id: "royalties", label: "Royalties & Analytics", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="bg-card/50 backdrop-blur-sm border-r border-border h-screen w-64 p-6 fixed left-0 top-0 z-40">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          All Access Artist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">giving you all access to build a career you're proud of</p>
      </div>
      
      <div className="space-y-2">
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
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
              {item.id === "content" && (
                <Badge variant="secondary" className="ml-auto">
                  New
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};