import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  Home,
  TrendingUp,
  Heart,
  Users,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const ContentCalendar = () => {
  const { toast } = useToast();
  const [brandPillars, setBrandPillars] = useState([
    "Upcoming Release",
    "New Songs I'm Working On", 
    "Covers of Songs I Love",
    "Personality/Lifestyle"
  ]);

  const [releases] = useState([
    {
      id: 1,
      title: "Summer Vibes EP",
      releaseDate: "2024-08-15",
      status: "In Progress",
      tracks: 4
    },
    {
      id: 2,
      title: "Midnight Dreams",
      releaseDate: "2024-09-02",
      status: "Planning",
      tracks: 1
    },
    {
      id: 3,
      title: "Acoustic Sessions Vol. 1",
      releaseDate: "2024-09-20",
      status: "Idea",
      tracks: 6
    }
  ]);
  
  const [scheduledContent, setScheduledContent] = useState([
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

  const platforms = [
    { name: "TikTok", icon: Video, color: "bg-pink-500", connected: true },
    { name: "Instagram", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500", connected: true },
    { name: "YouTube Shorts", icon: Play, color: "bg-red-500", connected: false },
    { name: "Twitter", icon: Share, color: "bg-blue-500", connected: false }
  ];

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

  const handlePostAtPeak = () => {
    toast({
      title: "Peak Time Analysis",
      description: "Analyzing your linked accounts for optimal posting times...",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Content Calendar</h2>
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

      {/* Brand Pillars House */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Your Content House
          </CardTitle>
          <CardDescription>
            Build a strong content foundation with your four brand pillars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-64 h-48 relative">
              {/* House Roof */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-32 border-r-32 border-b-16 border-l-transparent border-r-transparent border-b-primary"></div>
              
              {/* House Foundation */}
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-secondary to-secondary/50 rounded-lg border-2 border-border">
                
                {/* Four Pillars */}
                <div className="grid grid-cols-4 h-full">
                  {brandPillars.map((pillar, index) => {
                    const pillarCount = getPillarDistribution()[pillar] || 0;
                    const pillarHeight = Math.min(100, (pillarCount / 5) * 100); // Scale to max 100%
                    
                    return (
                      <div key={index} className="flex flex-col items-center justify-end p-1">
                        <div 
                          className={`w-6 bg-primary/80 rounded-sm transition-all duration-500 ${pillarHeight < 20 ? 'animate-pulse' : ''}`}
                          style={{ height: `${Math.max(20, pillarHeight)}%` }}
                        ></div>
                        <span className="text-xs mt-1 text-center font-medium truncate w-full">
                          {pillar.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brandPillars.map((pillar, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`pillar-${index}`}>Pillar {index + 1}</Label>
                <Input 
                  id={`pillar-${index}`}
                  value={pillar}
                  onChange={(e) => {
                    const newPillars = [...brandPillars];
                    newPillars[index] = e.target.value;
                    setBrandPillars(newPillars);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {getPillarDistribution()[pillar] || 0} posts this week
                </p>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Keep your content balanced across all pillars for authentic growth</p>
          </div>
        </CardContent>
      </Card>

      {/* Content Creation */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Quick Content Creator
              </CardTitle>
              <CardDescription>
                Create and schedule content for multiple platforms at once
              </CardDescription>
            </div>
            <Button variant="default">Upload Content</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content Title</label>
                <Input placeholder="Enter content title..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content Caption</label>
                <Textarea placeholder="What's this content about?" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Hashtags</label>
                <Input placeholder="#newmusic #artist #studio" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Target Platform</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Connected Platforms</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube Shorts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content Pillar</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content pillar" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandPillars.map((pillar, index) => (
                      <SelectItem key={index} value={pillar}>{pillar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Related Release</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to a release (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {releases.map((release) => (
                      <SelectItem key={release.id} value={release.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Music className="h-3 w-3" />
                          <span>{release.title}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {release.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Schedule Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" />
                  <Input type="time" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={handlePostAtPeak}
                >
                  <Zap className="mr-2 h-3 w-3" />
                  Post at Peak
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Save Draft
                </Button>
                <Button variant="default" className="flex-1">
                  Schedule Post
                </Button>
              </div>
            </div>
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

      {/* AI Content Suggestions */}
      <Card className="bg-gradient-accent/10 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            AI Content Suggestions
          </CardTitle>
          <CardDescription>
            Smart content ideas based on your music and audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h4 className="font-medium mb-2">Behind the Scenes</h4>
              <p className="text-sm text-muted-foreground mb-3">Show your creative process</p>
              <Button variant="outline" size="sm" className="w-full">
                Generate Ideas
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h4 className="font-medium mb-2">Trend Integration</h4>
              <p className="text-sm text-muted-foreground mb-3">Use trending sounds/hashtags</p>
              <Button variant="outline" size="sm" className="w-full">
                Find Trends
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h4 className="font-medium mb-2">Fan Engagement</h4>
              <p className="text-sm text-muted-foreground mb-3">Connect with your audience</p>
              <Button variant="outline" size="sm" className="w-full">
                Get Ideas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};