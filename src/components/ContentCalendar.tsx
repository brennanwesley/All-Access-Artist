import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  BarChart3
} from "lucide-react";

export const ContentCalendar = () => {
  const scheduledContent = [
    {
      id: 1,
      title: "Behind the Scenes - Studio Session",
      platform: "TikTok",
      scheduledTime: "Today 3:00 PM",
      status: "Scheduled",
      engagement: "High",
      content: "Recording new single 🎵",
      hashtags: "#newmusic #studio #artist"
    },
    {
      id: 2,
      title: "New Single Teaser",
      platform: "Instagram",
      scheduledTime: "Tomorrow 10:00 AM",
      status: "Draft",
      engagement: "Medium",
      content: "Get ready for something special...",
      hashtags: "#comingsoon #newmusic #teaser"
    },
    {
      id: 3,
      title: "Full Studio Session",
      platform: "YouTube Shorts",
      scheduledTime: "Aug 10 2:00 PM",
      status: "Posted",
      engagement: "High",
      content: "Watch me create magic in the studio",
      hashtags: "#youtube #studio #process"
    },
    {
      id: 4,
      title: "Acoustic Performance",
      platform: "Instagram",
      scheduledTime: "Aug 12 7:00 PM",
      status: "Scheduled",
      engagement: "Very High",
      content: "Stripped down version of my new song",
      hashtags: "#acoustic #live #music"
    }
  ];

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

      {/* Content Creation */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Quick Content Creator
          </CardTitle>
          <CardDescription>
            Create and schedule content for multiple platforms at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Content Title</label>
                <Input placeholder="Enter content title..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content Description</label>
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
                <label className="text-sm font-medium mb-2 block">Schedule Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" />
                  <Input type="time" />
                </div>
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