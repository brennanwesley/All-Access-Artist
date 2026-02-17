import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/components/auth/UserProfile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Users,
  MoreHorizontal,
  Megaphone,
} from "lucide-react";

type NavItem = {
  id: SectionId;
  label: string;
  mobileLabel?: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

const MOBILE_PRIMARY_NAV_IDS: SectionId[] = [
  "dashboard",
  "releases",
  "content",
  "settings",
];

export const Navigation = () => {
  const navigation = useNavigation()
  const location = useLocation()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const activeSection = sectionFromPath(location.pathname)
  const handleSectionChange = (section: SectionId) => {
    // Prevent redundant navigation calls
    if (section !== activeSection) {
      navigation.navigateToSection(section);
    }
  }

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "releases", label: "Releases", icon: Calendar },
    { id: "content", label: "Content Creator", mobileLabel: "Content", icon: Video },
    { id: "fans", label: "Fans", icon: Users, comingSoon: true },
    { id: "community", label: "Community", icon: Users, comingSoon: true },
    { id: "royalties", label: "Royalties", icon: DollarSign, comingSoon: true },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const mobilePrimaryNavItems = navItems.filter((item) =>
    MOBILE_PRIMARY_NAV_IDS.includes(item.id)
  );

  const mobileMoreNavItems: NavItem[] = [
    ...navItems.filter((item) => !MOBILE_PRIMARY_NAV_IDS.includes(item.id)),
    { id: "pitch", label: "DSP Pitch Tool", icon: Megaphone, comingSoon: true },
  ];

  const isMoreSectionActive = mobileMoreNavItems.some(
    (item) => item.id === activeSection
  );

  return (
    <>
      <nav className="bg-card/50 backdrop-blur-sm border-r border-border h-screen w-64 p-6 fixed left-0 top-0 z-40 hidden md:flex md:flex-col">
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
                {item.comingSoon && (
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

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="grid h-16 grid-cols-5 px-1">
          {mobilePrimaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className="h-full rounded-none px-1 text-[11px] font-medium flex flex-col gap-1"
                onClick={() => handleSectionChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.mobileLabel ?? item.label}</span>
              </Button>
            );
          })}

          <Button
            variant={isMoreSectionActive ? "default" : "ghost"}
            className="h-full rounded-none px-1 text-[11px] font-medium flex flex-col gap-1"
            onClick={() => setIsMoreOpen(true)}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span>More</span>
          </Button>
        </div>
      </nav>

      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="mb-2 text-left">
            <SheetTitle>More</SheetTitle>
          </SheetHeader>

          <div className="grid gap-2">
            {mobileMoreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className="h-12 justify-between"
                  onClick={() => {
                    handleSectionChange(item.id);
                    setIsMoreOpen(false);
                  }}
                >
                  <span className="flex items-center">
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </span>
                  {item.comingSoon && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground border-muted-foreground/30">
                      Coming Soon
                    </Badge>
                  )}
                </Button>
              );
            })}

            <div className="mt-2 border-t border-border pt-3">
              <UserProfile />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};