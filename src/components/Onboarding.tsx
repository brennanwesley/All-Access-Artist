import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      description: "Connect your Instagram account to sync content and analytics",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      category: "Social Media"
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Link your Facebook page for broader social media reach",
      color: "bg-blue-600",
      category: "Social Media"
    },
    {
      id: "tiktok",
      name: "TikTok",
      description: "Connect TikTok to manage your short-form content strategy",
      color: "bg-black",
      category: "Social Media"
    },
    {
      id: "snapchat",
      name: "Snapchat",
      description: "Integrate Snapchat for Stories and audience engagement",
      color: "bg-yellow-400",
      category: "Social Media"
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Link YouTube for video content management and analytics",
      color: "bg-red-600",
      category: "Social Media"
    },
    {
      id: "twitter",
      name: "Twitter 'X'",
      description: "Connect your X account for real-time updates and engagement",
      color: "bg-black",
      category: "Social Media"
    },
    {
      id: "discord",
      name: "Discord",
      description: "Link your Discord server for community management",
      color: "bg-indigo-600",
      category: "Social Media"
    },
    {
      id: "feature-fm",
      name: "feature.fm",
      description: "Connect your smart links and fan engagement platform",
      color: "bg-green-600",
      category: "Pre-Save Campaigns & Fan Data Collection"
    },
    {
      id: "distrokid",
      name: "DistroKid",
      description: "Sync your music distribution and release data",
      color: "bg-orange-500",
      category: "Distribution (Choose One)"
    },
    {
      id: "tunecore",
      name: "TuneCore",
      description: "Connect your TuneCore distribution account",
      color: "bg-blue-500",
      category: "Distribution (Choose One)"
    },
    {
      id: "cdbaby",
      name: "CD Baby",
      description: "Sync your CD Baby distribution and royalty data",
      color: "bg-red-500",
      category: "Distribution (Choose One)"
    },
    {
      id: "symphonic",
      name: "Symphonic",
      description: "Connect your Symphonic distribution platform",
      color: "bg-purple-600",
      category: "Distribution (Choose One)"
    },
    {
      id: "amuse",
      name: "Amuse",
      description: "Link your Amuse distribution account",
      color: "bg-pink-500",
      category: "Distribution (Choose One)"
    },
    {
      id: "routenote",
      name: "RouteNote",
      description: "Connect your RouteNote distribution platform",
      color: "bg-teal-600",
      category: "Distribution (Choose One)"
    },
    {
      id: "linktree",
      name: "Linktree",
      description: "Import your link-in-bio setup and analytics",
      color: "bg-green-500",
      category: "Link Management"
    },
    {
      id: "spotify-artists",
      name: "Spotify for Artists",
      description: "Access your Spotify streaming data and insights",
      color: "bg-green-500",
      category: "Streaming Analytics Dashboards"
    },
    {
      id: "apple-music",
      name: "Apple Music for Artists",
      description: "Connect Apple Music analytics and artist tools",
      color: "bg-gray-800",
      category: "Streaming Analytics Dashboards"
    },
    {
      id: "account",
      name: "Account",
      description: "Manage your profile, subscription, and personal information",
      color: "bg-slate-600",
      category: "Settings"
    },
    {
      id: "notifications",
      name: "Notifications",
      description: "Configure email, push, and in-app notification preferences",
      color: "bg-amber-600",
      category: "Settings"
    },
    {
      id: "privacy-security",
      name: "Privacy & Security",
      description: "Control data sharing, two-factor authentication, and privacy settings",
      color: "bg-emerald-600",
      category: "Settings"
    },
    {
      id: "preferences",
      name: "Preferences",
      description: "Customize your dashboard layout, themes, and user experience",
      color: "bg-violet-600",
      category: "Settings"
    },
    {
      id: "integrations",
      name: "Integrations",
      description: "Manage API connections and third-party app permissions",
      color: "bg-cyan-600",
      category: "Settings"
    }
  ];

  const categoryDescriptions = {
    "Social Media": "Connect your social platforms to centralize content management, track engagement metrics, and streamline your online presence across all major networks.",
    "Pre-Save Campaigns & Fan Data Collection": "Integrate tools that help you collect fan data, run pre-save campaigns, and build deeper relationships with your audience through targeted engagement strategies.",
    "Distribution (Choose One)": "Link your music distribution service to automatically sync release schedules, track performance across stores, and manage your catalog from one central dashboard.",
    "Link Management": "Connect your link-in-bio tools to unify your online presence and track how fans discover and engage with your content across different touchpoints.",
    "Streaming Analytics Dashboards": "Access comprehensive streaming data and artist insights to understand your audience demographics, track song performance, and make data-driven decisions about your music career.",
    "Settings": "Configure your account preferences, notification settings, privacy controls, and customize your experience to match your workflow and security requirements."
  };

  const toggleConnection = (platformId: string) => {
    setConnectedAccounts(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const groupedPlatforms = platforms.reduce((acc, platform) => {
    if (!acc[platform.category]) {
      acc[platform.category] = [];
    }
    acc[platform.category].push(platform);
    return acc;
  }, {} as Record<string, typeof platforms>);

  const connectedCount = connectedAccounts.length;
  const totalPlatforms = platforms.length;
  const progressPercentage = (connectedCount / totalPlatforms) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            From recording voice memos and scribbling song lyrics onto an old napkin in your bedroom to standing backstage at your first sold out show, we're giving you all access to build a career you're proud of.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect your accounts to unlock the full potential of All Access Artist
          </p>
        </div>

        {/* Progress */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Connection Progress</CardTitle>
            <CardDescription>
              {connectedCount} of {totalPlatforms} platforms connected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Categories */}
        <div className="space-y-8">
          {Object.entries(groupedPlatforms).map(([category, categoryPlatforms]) => (
            <div key={category} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{category}</h2>
                  <Badge variant="secondary">
                    {categoryPlatforms.filter(p => connectedAccounts.includes(p.id)).length}/{categoryPlatforms.length}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm max-w-4xl">
                  {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPlatforms.map((platform) => {
                  const isConnected = connectedAccounts.includes(platform.id);
                  
                  return (
                    <Card 
                      key={platform.id} 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        isConnected ? 'ring-2 ring-primary shadow-md' : ''
                      }`}
                      onClick={() => toggleConnection(platform.id)}
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-white font-bold text-lg`}>
                              {platform.name.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{platform.name}</CardTitle>
                            </div>
                          </div>
                          {isConnected ? (
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {platform.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant={isConnected ? "default" : "outline"} 
                          className="w-full"
                          size="sm"
                        >
                          {isConnected ? "Connected" : "Connect"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg"
            onClick={onComplete}
            disabled={connectedCount === 0}
          >
            {connectedCount === totalPlatforms ? "Complete Setup" : `Continue with ${connectedCount} Connected`}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-6 text-lg"
            onClick={onComplete}
          >
            Connect Accounts Later
          </Button>
        </div>
      </div>
    </div>
  );
};