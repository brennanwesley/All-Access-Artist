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
      category: "Video Platform"
    },
    {
      id: "feature-fm",
      name: "feature.fm",
      description: "Connect your smart links and fan engagement platform",
      color: "bg-green-600",
      category: "Music Tools"
    },
    {
      id: "distrokid",
      name: "DistroKid",
      description: "Sync your music distribution and release data",
      color: "bg-orange-500",
      category: "Distribution"
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
      category: "Streaming Platform"
    },
    {
      id: "apple-music",
      name: "Apple Music for Artists",
      description: "Connect Apple Music analytics and artist tools",
      color: "bg-gray-800",
      category: "Streaming Platform"
    }
  ];

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
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">{category}</h2>
                <Badge variant="secondary">
                  {categoryPlatforms.filter(p => connectedAccounts.includes(p.id)).length}/{categoryPlatforms.length}
                </Badge>
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