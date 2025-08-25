import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Plus, 
  Instagram,
  Play,
  Share,
  Home,
  Upload,
  Image,
  MessageCircle,
  Sparkles,
  Download,
  Trash2
} from "lucide-react";
import { useState } from "react";

export const ContentCreator = () => {
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

  // Brand assets for AI generation reference
  const [brandAssets, setBrandAssets] = useState<Array<{
    id: number;
    name: string;
    file: File | null;
    preview: string | null;
  }>>([
    { id: 1, name: "Headshot", file: null, preview: null },
    { id: 2, name: "Performance Shot", file: null, preview: null },
    { id: 3, name: "Lifestyle Photo", file: null, preview: null }
  ]);

  // Generated content library
  const [generatedContent] = useState([
    {
      id: "gen_1",
      title: "Studio Vibes",
      file_url: "/placeholder.svg",
      prompt_text: "Artist in recording studio with warm lighting",
      created_at: "2025-08-24T10:30:00Z",
      content_type: "image"
    }
  ]);

  // Handle brand asset upload
  const handleAssetUpload = (assetId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBrandAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, file, preview: e.target?.result as string }
          : asset
      ));
    };
    reader.readAsDataURL(file);
  };

  // Remove brand asset
  const removeAsset = (assetId: number) => {
    setBrandAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, file: null, preview: null }
        : asset
    ));
  };

  const getPillarDistribution = (): Record<string, number> => {
    // For MVP, show static distribution - will connect to real data later
    return {
      "Upcoming Release": 3,
      "New Songs I'm Working On": 5,
      "Covers of Songs I Love": 2,
      "Personality/Lifestyle": 4
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Content Creator</h2>
          <p className="text-muted-foreground mt-2">
            Connect with your audience genuinely through original, custom-made content.
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Content
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

      {/* Craft Your Brand */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Craft Your Brand
          </CardTitle>
          <CardDescription>
            Provide up to 3 reference photos to inspire creations that match your aesthetic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {brandAssets.map((asset) => (
              <div key={asset.id} className="relative">
                <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 bg-secondary/20 flex flex-col items-center justify-center p-4 hover:border-primary/50 transition-colors">
                  {asset.preview ? (
                    <>
                      <img 
                        src={asset.preview} 
                        alt={asset.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => removeAsset(asset.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-center">{asset.name}</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">Click to upload</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAssetUpload(asset.id, file);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>These images will be used as reference for AI-generated content</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Content Assistant */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Content Assistant
          </CardTitle>
          <CardDescription>
            Get personalized content ideas and strategy advice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    Hi! I'm your AI content assistant. I can help you brainstorm ideas, plan your content strategy, and create engaging posts. What would you like to work on today?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      Content Ideas
                    </Button>
                    <Button variant="outline" size="sm">
                      Caption Writing
                    </Button>
                    <Button variant="outline" size="sm">
                      Strategy Tips
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask me anything about content creation..."
                className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background text-sm"
              />
              <Button size="sm">
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Generation Studio */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Image Generation Studio
          </CardTitle>
          <CardDescription>
            Create unique images with AI using your brand assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <h4 className="font-semibold mb-2">Generate Your Next Post Image</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Describe what you want to create and our AI will generate a unique image using your brand assets as reference.
              </p>
              <div className="space-y-3">
                <textarea 
                  placeholder="Describe the image you want to create... (e.g., 'Me performing on stage with dramatic lighting and crowd in background')"
                  className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background text-sm resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {brandAssets.filter(a => a.file).length} of 3 brand assets uploaded
                  </div>
                  <Button variant="hero">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Library */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Your Content Library
          </CardTitle>
          <CardDescription>
            All your generated content ready to download and use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedContent.map((content) => (
              <div key={content.id} className="group relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-secondary/20 border border-border/50">
                  <img 
                    src={content.file_url} 
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="secondary" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium truncate">{content.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{content.prompt_text}</p>
                </div>
              </div>
            ))}
            <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 bg-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Generate more content</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
