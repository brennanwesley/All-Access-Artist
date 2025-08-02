import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Music, Save, Users, Percent } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type ActiveTemplate = "main" | "labelCopy" | "lyricSheet" | "splitSheet";

export const MetadataPrep = () => {
  const [activeTemplate, setActiveTemplate] = useState<ActiveTemplate>("main");
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Saved Successfully",
      description: "Your metadata has been saved to your project.",
    });
  };

  if (activeTemplate === "labelCopy") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTemplate("main")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-3xl font-bold">Label Copy Template</h2>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Track Information
            </CardTitle>
            <CardDescription>
              Fill out all required information for your label copy sheet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackTitle">Track Title *</Label>
                <Input id="trackTitle" placeholder="Enter track title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist Name *</Label>
                <Input id="artist" placeholder="Enter artist name" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="album">Album/EP Title</Label>
                <Input id="album" placeholder="Enter album/EP title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackNumber">Track Number</Label>
                <Input id="trackNumber" type="number" placeholder="1" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Track Duration *</Label>
                <Input id="duration" placeholder="3:45" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Primary Genre *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="indie">Indie</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="r&b">R&B</SelectItem>
                    <SelectItem value="folk">Folk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="writers">Songwriters/Composers *</Label>
              <Input id="writers" placeholder="John Doe, Jane Smith" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="producers">Producers</Label>
              <Input id="producers" placeholder="Producer names" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Record Label</Label>
                <Input id="label" placeholder="Independent / Label name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Year *</Label>
                <Input id="copyright" placeholder="2024" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isrc">ISRC Code</Label>
              <Input id="isrc" placeholder="US-XXX-XX-XXXXX" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Track Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of the track for promotional use..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Label Copy
              </Button>
              <Button variant="outline">Export to PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTemplate === "lyricSheet") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTemplate("main")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-3xl font-bold">Lyric Sheet Template</h2>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Song Details
            </CardTitle>
            <CardDescription>
              Create a professional lyric sheet with proper structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="songTitle">Song Title *</Label>
                <Input id="songTitle" placeholder="Enter song title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="writtenBy">Written By *</Label>
                <Input id="writtenBy" placeholder="Writer names" />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Song Structure</Label>
              
              {/* Dynamic song sections */}
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex gap-2 items-start">
                    <Select defaultValue="verse">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verse">Verse</SelectItem>
                        <SelectItem value="chorus">Chorus</SelectItem>
                        <SelectItem value="pre-chorus">Pre-Chorus</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                        <SelectItem value="refrain">Refrain</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                        <SelectItem value="intro">Intro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Enter lyrics for this section..."
                      className="flex-1"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <Select defaultValue="chorus">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verse">Verse</SelectItem>
                        <SelectItem value="chorus">Chorus</SelectItem>
                        <SelectItem value="pre-chorus">Pre-Chorus</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                        <SelectItem value="refrain">Refrain</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                        <SelectItem value="intro">Intro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Enter lyrics for this section..."
                      className="flex-1"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 items-start">
                    <Select defaultValue="verse">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verse">Verse</SelectItem>
                        <SelectItem value="chorus">Chorus</SelectItem>
                        <SelectItem value="pre-chorus">Pre-Chorus</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                        <SelectItem value="refrain">Refrain</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                        <SelectItem value="intro">Intro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Enter lyrics for this section..."
                      className="flex-1"
                      rows={4}
                    />
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  + Add Section
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any additional notes, vocal directions, or performance notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Lyric Sheet
              </Button>
              <Button variant="outline">Export to PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTemplate === "splitSheet") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTemplate("main")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-3xl font-bold">Split Sheet Template</h2>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Song Information
            </CardTitle>
            <CardDescription>
              Document songwriter credits and publishing split percentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="songTitle">Song Title *</Label>
                <Input id="songTitle" placeholder="Enter song title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist *</Label>
                <Input id="artist" placeholder="Enter artist name" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="album">Album/Project</Label>
                <Input id="album" placeholder="Album or project name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date Created</Label>
                <Input id="date" type="date" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                <Label className="text-base font-semibold">Writer Credits & Splits</Label>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Writer Name</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-2">Split %</div>
                  <div className="col-span-3">Publishing Info</div>
                </div>
                
                {/* Writer 1 */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <Input placeholder="Full legal name" />
                  </div>
                  <div className="col-span-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="writer">Writer</SelectItem>
                        <SelectItem value="co-writer">Co-Writer</SelectItem>
                        <SelectItem value="producer">Producer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="%" type="number" min="0" max="100" />
                  </div>
                  <div className="col-span-3">
                    <Input placeholder="Publisher/PRO" />
                  </div>
                </div>

                {/* Writer 2 */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <Input placeholder="Full legal name" />
                  </div>
                  <div className="col-span-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="writer">Writer</SelectItem>
                        <SelectItem value="co-writer">Co-Writer</SelectItem>
                        <SelectItem value="producer">Producer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="%" type="number" min="0" max="100" />
                  </div>
                  <div className="col-span-3">
                    <Input placeholder="Publisher/PRO" />
                  </div>
                </div>

                {/* Writer 3 */}
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <Input placeholder="Full legal name" />
                  </div>
                  <div className="col-span-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="writer">Writer</SelectItem>
                        <SelectItem value="co-writer">Co-Writer</SelectItem>
                        <SelectItem value="producer">Producer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="%" type="number" min="0" max="100" />
                  </div>
                  <div className="col-span-3">
                    <Input placeholder="Publisher/PRO" />
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  + Add Writer
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any additional terms, agreements, or notes about the splits..."
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This split sheet serves as a working document. 
                All parties should review and agree to these terms before finalizing. 
                Consider having this document reviewed by legal counsel for official agreements.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Split Sheet
              </Button>
              <Button variant="outline">Export to PDF</Button>
              <Button variant="outline">Send for Signatures</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Metadata Management</h2>
        <p className="text-muted-foreground mt-2">
          Streamline your track metadata for all DSPs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Label Copy
            </CardTitle>
            <CardDescription>
              Generate comprehensive label copy with all required metadata fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => setActiveTemplate("labelCopy")}
            >
              Create My Label Copy
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Lyric Sheet
            </CardTitle>
            <CardDescription>
              Create structured lyric sheets with proper song sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setActiveTemplate("lyricSheet")}
            >
               Create Lyric Sheet
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Split Sheet
            </CardTitle>
            <CardDescription>
              Manage songwriter credits and publishing splits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setActiveTemplate("splitSheet")}
            >
              Create Split Sheet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};