import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock, 
  Instagram,
  Music,
  Play,
  Edit,
  Share,
  BarChart3,
  Home
} from "lucide-react";
import { useState } from "react";

export const ContentCalendar = () => {
  const [brandPillars] = useState([
    "Upcoming Release",
    "New Songs I'm Working On", 
    "Covers of Songs I Love",
    "Personality/Lifestyle"
  ]);

  const platforms = [
    { name: "TikTok", icon: Video, color: "bg-pink-500", connected: true },
    { name: "Instagram", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500", connected: true },
    { name: "YouTube Shorts", icon: Play, color: "bg-red-500", connected: false },
    { name: "Twitter", icon: Share, color: "bg-blue-500", connected: false }
  ];

  const [scheduledContent] = useState([
    {
      id: 1,
      title: "Behind the Scenes - Studio Session",
      platform: "TikTok",
      scheduledTime: "Today 3:00 PM",
      status: "Scheduled",
      engagement: "High",
      content: "Recording new single 🎵",
      hashtags: "#newmusic #studio #artist",
      pillar: "New Songs I'm Working On"
    },
    {
      id: 2,
      title: "New Single Teaser",
      platform: "Instagram",
      scheduledTime: "Tomorrow 10:00 AM",
      status: "Draft",
      engagement: "Medium",
      content: "Get ready for something special...",
      hashtags: "#comingsoon #newmusic #teaser",
      pillar: "Upcoming Release"
    },
    {
      id: 3,
      title: "Full Studio Session",
      platform: "YouTube Shorts",
      scheduledTime: "Aug 10 2:00 PM",
      status: "Posted",
      engagement: "High",
      content: "Watch me create magic in the studio",
      hashtags: "#youtube #studio #process",
      pillar: "New Songs I'm Working On"
    },
    {
      id: 4,
      title: "Acoustic Performance",
      platform: "Instagram",
      scheduledTime: "Aug 12 7:00 PM",
      status: "Scheduled",
      engagement: "Very High",
      content: "Stripped down version of my new song",
      hashtags: "#acoustic #live #music",
      pillar: "Covers of Songs I Love"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Posted": return "default";
      case "Scheduled": return "secondary";
      case "Draft": return "outline";
      default: return "secondary";
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "Very High": return "text-green-500";
      case "High": return "text-blue-500";
      case "Medium": return "text-yellow-500";
      case "Low": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getPillarDistribution = () => {
    const distribution = brandPillars.reduce((acc, pillar) => {
      acc[pillar] = scheduledContent.filter(content => content.pillar === pillar).length;
      return acc;
    }, {} as Record<string, number>);
    return distribution;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Content Planner</h2>
          <p className="text-muted-foreground mt-2">
            Create, schedule, and manage content across all platforms
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Content
        </Button>
      </div>

      {/* Platform Connections */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5 text-primary" />
            Connected Platforms
          </CardTitle>
          <CardDescription>
            Manage your social media platform connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.name} className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-sm">{platform.name}</span>
                  </div>
                  <Badge variant={platform.connected ? "default" : "outline"}>
                    {platform.connected ? "Connected" : "Connect"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Brand Pillars - Simplified */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Your Content Pillars
          </CardTitle>
          <CardDescription>
            Track your content distribution across brand pillars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {brandPillars.map((pillar, index) => {
              const pillarCount = getPillarDistribution()[pillar] || 0;
              return (
                <div key={index} className="text-center p-3 rounded-lg bg-secondary/20 border border-border/50">
                  <div className="text-2xl font-bold text-primary mb-1">{pillarCount}</div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {pillar.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>Keep your content balanced across all pillars for authentic growth</p>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Content */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Scheduled Content
          </CardTitle>
          <CardDescription>
            Your upcoming and recent posts across all platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledContent.map((content) => (
              <div key={content.id} className="p-4 rounded-lg bg-secondary/20 border border-border/50 hover:shadow-elegant transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{content.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {content.platform}
                      </Badge>
                      <Badge variant={getStatusColor(content.status)} className="text-xs">
                        {content.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{content.content}</p>
                    <p className="text-xs text-muted-foreground">{content.hashtags}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      {content.scheduledTime}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <BarChart3 className="h-3 w-3" />
                      <span className={getEngagementColor(content.engagement)}>
                        {content.engagement} Engagement
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                  <Button variant="default" size="sm">
                    <BarChart3 className="mr-1 h-3 w-3" />
                    Analytics
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Content Ideas - Simplified */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Quick Content Ideas
          </CardTitle>
          <CardDescription>
            Simple content suggestions for your next post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Behind the Scenes</span>
                <Badge variant="outline" className="text-xs">Studio</Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Song Snippet</span>
                <Badge variant="outline" className="text-xs">Music</Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Fan Q&A</span>
                <Badge variant="outline" className="text-xs">Engagement</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
