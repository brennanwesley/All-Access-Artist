import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Image, Calendar, Music, Upload, Download, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const Create = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const { toast } = useToast();

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    toast({
      title: "Generating content...",
      description: "Your AI-generated content will be ready shortly!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Creation Studio</h1>
        <p className="text-muted-foreground">AI-powered tools to create professional marketing materials</p>
      </div>

      {/* Creation Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creationTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className={`cursor-pointer hover:shadow-elegant transition-all ${
                selectedTool === tool.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedTool(tool.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {tool.name}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Output Formats:</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.dimensions.map((dim, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {dim}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Creation Form */}
      {selectedTool && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Create {creationTools.find(t => t.id === selectedTool)?.name}
            </CardTitle>
            <CardDescription>
              Upload your image and provide the necessary information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="base-image">Base Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="max-w-xs max-h-48 mx-auto rounded-lg"
                    />
                    <Button variant="outline" onClick={() => setUploadedImage(null)}>
                      Replace Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Upload your base image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content-specific fields */}
            {selectedTool === "press-release" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            )}

            {(selectedTool === "announce-banners" || selectedTool === "tour-announcement") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="main-text">Main Text</Label>
                  <Input id="main-text" placeholder="NEW SINGLE OUT NOW" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-text">Subtitle</Label>
                  <Input id="sub-text" placeholder="Stream everywhere" />
                </div>
                {selectedTool === "tour-announcement" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tour-dates">Tour Dates</Label>
                      <Textarea 
                        id="tour-dates" 
                        placeholder="March 15 - Nashville, TN&#10;March 18 - Atlanta, GA&#10;March 22 - Miami, FL"
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-info">Ticket Information</Label>
                      <Input id="ticket-info" placeholder="Tickets on sale Friday" />
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedTool === "lyric-video" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lyrics">Song Lyrics</Label>
                  <Textarea 
                    id="lyrics" 
                    placeholder="Paste your lyrics here..."
                    className="min-h-[200px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-style">Video Style</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Kinetic Typography</option>
                      <option>Minimalist</option>
                      <option>Animated Background</option>
                      <option>Photo Slideshow</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Match album artwork</option>
                      <option>Monochrome</option>
                      <option>Vibrant</option>
                      <option>Pastel</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedTool === "spotify-clips" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clip-style">Canvas Style</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Visualizer</option>
                    <option>Looping Artwork</option>
                    <option>Abstract Animation</option>
                    <option>Text Animation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input id="duration" type="number" min="3" max="8" defaultValue="6" />
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Output Formats</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {creationTools.find(t => t.id === selectedTool)?.dimensions.map((format, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-2">
              <Button onClick={handleGenerate} className="flex-1">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};