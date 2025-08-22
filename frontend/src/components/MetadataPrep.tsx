import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, Music, Save, Users, Percent, Globe, Clock, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type ActiveTemplate = "main" | "labelCopy" | "lyricSheet" | "splitSheet";

interface Track {
  id: string;
  songTitle: string;
  trackNumber: number;
  duration: string;
  isrc: string;
  versionSubtitle: string;
  featuredArtists: string;
  explicitContent: boolean;
  previewStartTime: number;
  mixEngineer: string;
  masteringEngineer: string;
  remixer: string;
  songwriters: string;
  producers: string;
  subGenre: string;
  languageLyrics: string;
}

interface ReleaseData {
  releaseTitle: string;
  artist: string;
  releaseType: string;
  releaseDate: string;
  copyright: string;
  upc: string;
  genre: string;
  languageLyrics: string;
  phonogramCopyright: string;
  compositionCopyright: string;
  label: string;
  territories: string;
  description: string;
}

export const MetadataPrep = () => {
  const [activeTemplate, setActiveTemplate] = useState<ActiveTemplate>("main");
  const [releaseData, setReleaseData] = useState<ReleaseData>({
    releaseTitle: "",
    artist: "",
    releaseType: "",
    releaseDate: "",
    copyright: "",
    upc: "",
    genre: "",
    languageLyrics: "en",
    phonogramCopyright: "",
    compositionCopyright: "",
    label: "",
    territories: "",
    description: ""
  });
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "1",
      songTitle: "",
      trackNumber: 1,
      duration: "",
      isrc: "",
      versionSubtitle: "",
      featuredArtists: "",
      explicitContent: false,
      previewStartTime: 30,
      mixEngineer: "",
      masteringEngineer: "",
      remixer: "",
      songwriters: "",
      producers: "",
      subGenre: "",
      languageLyrics: "en"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      songTitle: "",
      trackNumber: tracks.length + 1,
      duration: "",
      isrc: "",
      versionSubtitle: "",
      featuredArtists: "",
      explicitContent: false,
      previewStartTime: 30,
      mixEngineer: "",
      masteringEngineer: "",
      remixer: "",
      songwriters: "",
      producers: "",
      subGenre: "",
      languageLyrics: "en"
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (trackId: string) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(track => track.id !== trackId));
    }
  };

  const updateTrack = (trackId: string, field: keyof Track, value: any) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, [field]: value } : track
    ));
  };

  const updateReleaseData = (field: keyof ReleaseData, value: string) => {
    setReleaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!releaseData.releaseTitle || !releaseData.artist || !releaseData.releaseType || !releaseData.releaseDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (marked with *)",
          variant: "destructive"
        });
        return;
      }

      // Validate tracks
      for (const track of tracks) {
        if (!track.songTitle || !track.duration || !track.songwriters) {
          toast({
            title: "Validation Error", 
            description: "Please fill in required track fields (Song Title, Duration, Songwriters)",
            variant: "destructive"
          });
          return;
        }
      }

      // Create release payload
      const releasePayload = {
        title: releaseData.releaseTitle,
        artist: releaseData.artist,
        type: releaseData.releaseType,
        release_date: releaseData.releaseDate,
        copyright_year: parseInt(releaseData.copyright) || new Date().getFullYear(),
        upc_code: releaseData.upc,
        genre: releaseData.genre,
        language_lyrics: releaseData.languageLyrics,
        phonogram_copyright: releaseData.phonogramCopyright,
        composition_copyright: releaseData.compositionCopyright,
        record_label: releaseData.label,
        territories: releaseData.territories,
        description: releaseData.description
      };

      // Get API URL from environment
      const API_URL = import.meta.env['VITE_API_URL'] || 'https://all-access-artist.onrender.com';
      
      // Create release
      const releaseResponse = await fetch(`${API_URL}/api/releases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header when auth is implemented
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(releasePayload)
      });

      if (!releaseResponse.ok) {
        throw new Error('Failed to create release');
      }

      const release = await releaseResponse.json();

      // Create tracks
      for (const track of tracks) {
        const trackPayload = {
          release_id: release.id,
          title: track.songTitle,
          track_number: track.trackNumber,
          duration: track.duration,
          isrc_code: track.isrc,
          version_subtitle: track.versionSubtitle,
          featured_artists: track.featuredArtists,
          explicit_content: track.explicitContent,
          preview_start_time: track.previewStartTime,
          mix_engineer: track.mixEngineer,
          mastering_engineer: track.masteringEngineer,
          remixer: track.remixer,
          songwriters: track.songwriters,
          producers: track.producers,
          sub_genre: track.subGenre,
          language_lyrics: track.languageLyrics
        };

        const trackResponse = await fetch(`${API_URL}/api/songs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // TODO: Add authentication header when auth is implemented
          },
          body: JSON.stringify(trackPayload)
        });

        if (!trackResponse.ok) {
          throw new Error(`Failed to create track: ${track.songTitle}`);
        }
      }

      toast({
        title: "Label Copy Saved Successfully",
        description: `Release "${releaseData.releaseTitle}" with ${tracks.length} track${tracks.length !== 1 ? 's' : ''} has been saved.`,
      });

      // Reset form after successful save
      setReleaseData({
        releaseTitle: "",
        artist: "",
        releaseType: "",
        releaseDate: "",
        copyright: "",
        upc: "",
        genre: "",
        languageLyrics: "en",
        phonogramCopyright: "",
        compositionCopyright: "",
        label: "",
        territories: "",
        description: ""
      });
      
      setTracks([{
        id: "1",
        songTitle: "",
        trackNumber: 1,
        duration: "",
        isrc: "",
        versionSubtitle: "",
        featuredArtists: "",
        explicitContent: false,
        previewStartTime: 30,
        mixEngineer: "",
        masteringEngineer: "",
        remixer: "",
        songwriters: "",
        producers: "",
        subGenre: "",
        languageLyrics: "en"
      }]);

    } catch (error) {
      console.error('Error saving Label Copy:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your Label Copy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

        {/* Release Information Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Release Information
            </CardTitle>
            <CardDescription>
              Master information for this Label Copy document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseTitle">Release Title *</Label>
                <Input 
                  id="releaseTitle" 
                  value={releaseData.releaseTitle}
                  onChange={(e) => updateReleaseData('releaseTitle', e.target.value)}
                  placeholder="Album/EP/Single title" 
                  className="w-full" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist Name *</Label>
                <Input 
                  id="artist" 
                  value={releaseData.artist}
                  onChange={(e) => updateReleaseData('artist', e.target.value)}
                  placeholder="Enter artist name" 
                  className="w-full" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseType">Release Type *</Label>
                <Select value={releaseData.releaseType} onValueChange={(value) => updateReleaseData('releaseType', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                    <SelectItem value="mixtape">Mixtape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date *</Label>
                <Input 
                  id="releaseDate" 
                  type="date" 
                  value={releaseData.releaseDate}
                  onChange={(e) => updateReleaseData('releaseDate', e.target.value)}
                  className="w-full" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Year *</Label>
                <Input 
                  id="copyright" 
                  type="number" 
                  value={releaseData.copyright}
                  onChange={(e) => updateReleaseData('copyright', e.target.value)}
                  placeholder="2025" 
                  className="w-full" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upc">UPC Code</Label>
                <Input 
                  id="upc" 
                  value={releaseData.upc}
                  onChange={(e) => updateReleaseData('upc', e.target.value)}
                  placeholder="123456789012" 
                  className="w-full" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Primary Genre *</Label>
                <Select value={releaseData.genre} onValueChange={(value) => updateReleaseData('genre', value)}>
                  <SelectTrigger className="w-full">
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
              <div className="space-y-2">
                <Label htmlFor="languageLyrics">Primary Language</Label>
                <Select value={releaseData.languageLyrics} onValueChange={(value) => updateReleaseData('languageLyrics', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phonogramCopyright">Phonogram Copyright (℗)</Label>
                <Input 
                  id="phonogramCopyright" 
                  value={releaseData.phonogramCopyright}
                  onChange={(e) => updateReleaseData('phonogramCopyright', e.target.value)}
                  placeholder="℗ 2025 Record Label Name" 
                  className="w-full" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compositionCopyright">Composition Copyright (©)</Label>
                <Input 
                  id="compositionCopyright" 
                  value={releaseData.compositionCopyright}
                  onChange={(e) => updateReleaseData('compositionCopyright', e.target.value)}
                  placeholder="© 2025 Publishing Company" 
                  className="w-full" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Record Label</Label>
                <Input 
                  id="label" 
                  value={releaseData.label}
                  onChange={(e) => updateReleaseData('label', e.target.value)}
                  placeholder="Independent / Label name" 
                  className="w-full" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="territories" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Territories (comma-separated)
                </Label>
                <Input 
                  id="territories" 
                  value={releaseData.territories}
                  onChange={(e) => updateReleaseData('territories', e.target.value)}
                  placeholder="US, CA, UK, AU, DE" 
                  className="w-full" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Release Description</Label>
              <Textarea 
                id="description" 
                value={releaseData.description}
                onChange={(e) => updateReleaseData('description', e.target.value)}
                placeholder="Brief description of the release for promotional use..."
                rows={3}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tracks Information Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Track Listing
            </CardTitle>
            <CardDescription>
              Individual track information for this release
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {tracks.map((track, index) => (
              <div key={track.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold">Track {track.trackNumber}</h4>
                  {tracks.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeTrack(track.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Basic Track Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Song Title *</Label>
                    <Input 
                      value={track.songTitle}
                      onChange={(e) => updateTrack(track.id, 'songTitle', e.target.value)}
                      placeholder="Enter song title" 
                      className="w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Input 
                      value={track.duration}
                      onChange={(e) => updateTrack(track.id, 'duration', e.target.value)}
                      placeholder="3:45" 
                      className="w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ISRC Code</Label>
                    <Input 
                      value={track.isrc}
                      onChange={(e) => updateTrack(track.id, 'isrc', e.target.value)}
                      placeholder="US-XXX-XX-XXXXX" 
                      className="w-full" 
                    />
                  </div>
                </div>

                {/* Version & Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Version Subtitle</Label>
                    <Input 
                      value={track.versionSubtitle}
                      onChange={(e) => updateTrack(track.id, 'versionSubtitle', e.target.value)}
                      placeholder="Radio Edit, Extended Mix, Acoustic" 
                      className="w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Featured Artists</Label>
                    <Input 
                      value={track.featuredArtists}
                      onChange={(e) => updateTrack(track.id, 'featuredArtists', e.target.value)}
                      placeholder="Artist Name, Another Artist" 
                      className="w-full" 
                    />
                  </div>
                </div>

                {/* Credits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Songwriters *</Label>
                    <Input 
                      value={track.songwriters}
                      onChange={(e) => updateTrack(track.id, 'songwriters', e.target.value)}
                      placeholder="John Doe, Jane Smith" 
                      className="w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Producers</Label>
                    <Input 
                      value={track.producers}
                      onChange={(e) => updateTrack(track.id, 'producers', e.target.value)}
                      placeholder="Producer names" 
                      className="w-full" 
                    />
                  </div>
                </div>

                {/* Engineers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Mix Engineer</Label>
                    <Input 
                      value={track.mixEngineer}
                      onChange={(e) => updateTrack(track.id, 'mixEngineer', e.target.value)}
                      placeholder="Engineer name" 
                      className="w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mastering Engineer</Label>
                    <Input 
                      value={track.masteringEngineer}
                      onChange={(e) => updateTrack(track.id, 'masteringEngineer', e.target.value)}
                      placeholder="Engineer name" 
                      className="w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Remixer</Label>
                    <Input 
                      value={track.remixer}
                      onChange={(e) => updateTrack(track.id, 'remixer', e.target.value)}
                      placeholder="Remixer name" 
                      className="w-full" 
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sub-Genre</Label>
                    <Input 
                      value={track.subGenre}
                      onChange={(e) => updateTrack(track.id, 'subGenre', e.target.value)}
                      placeholder="Dance Pop, Alternative Rock" 
                      className="w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Preview Start Time (seconds)
                    </Label>
                    <Input 
                      type="number"
                      value={track.previewStartTime}
                      onChange={(e) => updateTrack(track.id, 'previewStartTime', parseInt(e.target.value) || 0)}
                      placeholder="30" 
                      className="w-full" 
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id={`explicit-${track.id}`}
                      checked={track.explicitContent}
                      onCheckedChange={(checked) => updateTrack(track.id, 'explicitContent', checked)}
                    />
                    <Label htmlFor={`explicit-${track.id}`} className="text-sm font-medium">
                      Explicit Content
                    </Label>
                  </div>
                </div>
              </div>
            ))}

            <Button 
              onClick={addTrack}
              variant="outline" 
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Track
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Label Copy'}
          </Button>
          <Button variant="outline">Export to PDF</Button>
        </div>
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