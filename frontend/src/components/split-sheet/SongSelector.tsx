import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Music } from "lucide-react";
import { Song } from "@/hooks/api/useReleaseDetails";

interface SongSelectorProps {
  songs: Song[];
  onSongSelect: (songId: string, songTitle: string) => void;
  onBack: () => void;
}

export const SongSelector = ({ songs, onSongSelect, onBack }: SongSelectorProps) => {
  const [selectedSongId, setSelectedSongId] = useState<string>("");

  const handleContinue = () => {
    const selectedSong = songs.find(song => song.id === selectedSongId);
    if (selectedSong) {
      onSongSelect(selectedSongId, selectedSong.title);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Split Sheet Creation</h2>
        <p className="text-lg text-muted-foreground">
          To create your split sheet begin by selecting which song or track.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Select Song
          </CardTitle>
          <CardDescription>
            Choose the song you want to create a split sheet for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="song-select">Song/Track *</Label>
            <Select value={selectedSongId} onValueChange={setSelectedSongId}>
              <SelectTrigger id="song-select">
                <SelectValue placeholder="Select a song..." />
              </SelectTrigger>
              <SelectContent>
                {songs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleContinue} 
              disabled={!selectedSongId}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
