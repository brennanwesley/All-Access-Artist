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
  Sparkles,
  Download,
  Trash2,
  FileText,
  Calendar,
  Music,
  Wand2
} from "lucide-react";
import { XIcon } from "@/components/ui/x-icon";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSocialMediaUrls } from '../hooks/api/useSocialMedia'
import { SocialConnectionModal } from "@/components/SocialConnectionModal";

export const ContentCreator = () => {
  const { toast } = useToast();
  const [brandPillars] = useState([
    "Upcoming Release",
    "New Songs I'm Working On", 
    "Covers of Songs I Love",
    "Personality/Lifestyle"
  ]);

  // Professional Content Tools state
  const [selectedProfessionalTool, setSelectedProfessionalTool] = useState<string | null>(null);
  const [selectedBaseAsset, setSelectedBaseAsset] = useState<number | null>(null);

  // Social media connection state
  const { data: socialMediaUrls } = useSocialMediaUrls();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<{ id: string; name: string } | null>(null);

   //new - Optional safety net: fire once when Instagram URL appears
  useEffect(() => {
    const ig = (socialMediaUrls as any)?.instagram_url as string | undefined;
    if (!ig) return;
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('igWebhookFired') === '1') return;
    handleSocialConnected('instagram', ig)
      .finally(() => {
        try { window.sessionStorage.setItem('igWebhookFired', '1'); } catch {}
      });
  }, [socialMediaUrls?.instagram_url]);

  // Creation tools from Create.tsx
  const creationTools = [
    {
      id: "press-release",
      name: "Press Release",
      icon: FileText,
      description: "Generate professional press releases for your music",
      dimensions: ["Document format"]
    },
    {
      id: "lyric-video",
      name: "Lyric Video",
      icon: Video,
      description: "Create engaging lyric videos for your songs",
      dimensions: ["1920x1080 (YouTube)", "1080x1080 (Instagram)", "1080x1920 (TikTok)"]
    },
    {
      id: "announce-banners",
      name: "Announce Banners",
      icon: Image,
      description: "Design eye-catching announcement graphics",
      dimensions: ["1080x566", "1080x1080", "1080x1350", "1920x1080"]
    },
    {
      id: "tour-announcement",
      name: "Tour Announcement",
      icon: Calendar,
      description: "Create professional tour announcement graphics",
      dimensions: ["1080x566", "1080x1080", "1080x1350", "1920x1080"]
    },
    {
      id: "spotify-clips",
      name: "Spotify Clips",
      icon: Music,
      description: "Generate Spotify Canvas clips for your tracks",
      dimensions: ["1080x1920 (Canvas)", "640x640 (Story)"]
    }
  ];

  const platforms = [
    { id: "tiktok", name: "TikTok", icon: Video, color: "bg-pink-500", connected: true },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500", connected: true },
    { id: "youtube", name: "YouTube Shorts", icon: Play, color: "bg-red-500", connected: false },
    { id: "twitter", name: "X (aka Twitter)", icon: XIcon, color: "bg-black", connected: false }
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

  // Handle professional content generation
  const handleProfessionalGenerate = () => {
    toast({
      title: "Generating content...",
      description: "Your AI-generated content will be ready shortly!",
    });
  };

  // Extract username from URL for display
  const extractUsername = (url: string, platformId: string): string => {
    if (!url) return "";
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      switch (platformId) {
        case "tiktok":
          return pathname.replace(/^\/(@)?/, "@");
        case "instagram":
          return pathname.replace(/^\//, "@");
        case "youtube":
          return pathname.replace(/^\/(@)?/, "@");
        case "twitter":
          return pathname.replace(/^\//, "@");
        default:
          return pathname.replace(/^\//, "@");
      }
    } catch {
      return url;
    }
  };

  // Handle platform connection
  const handlePlatformClick = (platform: { id: string; name: string }) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
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
      <div>
        <h2 className="text-3xl font-bold">Content Creator</h2>
        <p className="text-muted-foreground mt-2">
          Connect with your audience genuinely through original, custom-made content.
        </p>
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
              const platformKey = `${platform.id}_url` as keyof typeof socialMediaUrls;
              const isConnected = socialMediaUrls?.[platformKey];
              const username = isConnected ? extractUsername(socialMediaUrls[platformKey] || "", platform.id) : "";
              
              
              return (
                <div key={platform.id} className="flex flex-col p-4 rounded-lg bg-secondary/20 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">{platform.name}</span>
                    </div>
                  </div>
                  
                  {username && (
                    <div className="mb-2 px-2">
                      <span className="text-xs text-muted-foreground">{username}</span>
                    </div>
                  )}
                  
                  <Button
                    variant={isConnected ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => handlePlatformClick({ id: platform.id, name: platform.name })}
                  >
                    {isConnected ? "Connected" : "Connect"}
                  </Button>
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


      {/* Professional Content Tools */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Professional Content Tools
          </CardTitle>
          <CardDescription>
            Create marketing materials and promotional content using your brand assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Tool Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creationTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.id}
                  className={`relative cursor-pointer p-4 rounded-lg border transition-all hover:shadow-md ${
                    selectedProfessionalTool === tool.id 
                      ? "bg-primary/10 border-primary/50 ring-2 ring-primary/20" 
                      : "bg-secondary/20 border-border/50 hover:border-primary/30"
                  } ${tool.id !== "press-release" ? "opacity-75" : ""}`}
                  onClick={() => tool.id === "press-release" ? setSelectedProfessionalTool(tool.id) : null}
                >
                  {tool.id !== "press-release" && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm">{tool.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.dimensions.slice(0, 2).map((dim, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {dim}
                      </Badge>
                    ))}
                    {tool.dimensions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{tool.dimensions.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Form Section */}
          {selectedProfessionalTool === "press-release" && (
            <div className="p-6 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">
                  Create {creationTools.find(t => t.id === selectedProfessionalTool)?.name}
                </h4>
              </div>
              
              {/* Base Image Upload - Uses existing brand assets */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Base Image</Label>
                <div className="grid grid-cols-3 gap-3">
                  {brandAssets.map((asset) => (
                    <div 
                      key={asset.id}
                      className={`aspect-square rounded-lg border-2 cursor-pointer transition-all ${
                        selectedBaseAsset === asset.id 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-border/50 hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedBaseAsset(asset.preview ? asset.id : null)}
                    >
                      {asset.preview ? (
                        <img 
                          src={asset.preview} 
                          alt={asset.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/20 rounded-lg">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Select a brand asset to use as the base for your {creationTools.find(t => t.id === selectedProfessionalTool)?.name.toLowerCase()}
                </p>
              </div>

              {/* Tool-Specific Forms - Only Press Release is functional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="song-title">Song/Album Title</Label>
                  <Input id="song-title" placeholder="Enter title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release-date">Release Date</Label>
                  <Input id="release-date" type="date" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="press-content">Key Information</Label>
                  <Textarea 
                    id="press-content" 
                    placeholder="Describe your release, inspiration, collaborations, etc..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Output Format Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Output Formats</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {creationTools.find(t => t.id === selectedProfessionalTool)?.dimensions.map((format, index) => (
                    <label key={index} className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {brandAssets.filter(a => a.file).length} brand assets • {selectedBaseAsset ? '1 selected' : 'No base selected'}
                </div>
                <Button 
                  variant="hero" 
                  disabled={!selectedBaseAsset}
                  onClick={handleProfessionalGenerate}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {creationTools.find(t => t.id === selectedProfessionalTool)?.name}
                </Button>
              </div>
            </div>
          )}
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

      {/* Social Connection Modal */}
      <SocialConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={selectedPlatform}
        currentUrl={selectedPlatform ? socialMediaUrls?.[`${selectedPlatform.id}_url` as keyof typeof socialMediaUrls] || "" : ""}
      />
    </div>
  );
};
