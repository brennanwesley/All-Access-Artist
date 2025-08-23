import { useState } from "react";
import { SongSelector } from "./SongSelector";
import { SplitSheetForm } from "./SplitSheetForm";
import { Song } from "@/hooks/api/useReleaseDetails";

interface SplitSheetTemplateProps {
  releaseId?: string;
  existingSongs?: Song[];
  onBack: () => void;
}

export const SplitSheetTemplate = ({ 
  releaseId, 
  existingSongs = [], 
  onBack 
}: SplitSheetTemplateProps) => {
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedSongTitle, setSelectedSongTitle] = useState<string>("");

  const handleSongSelect = (songId: string, songTitle: string) => {
    setSelectedSongId(songId);
    setSelectedSongTitle(songTitle);
  };

  const handleBackToSongSelector = () => {
    setSelectedSongId(null);
    setSelectedSongTitle("");
  };

  // If no song selected, show song selector
  if (!selectedSongId) {
    return (
      <SongSelector
        songs={existingSongs}
        onSongSelect={handleSongSelect}
        onBack={onBack}
      />
    );
  }

  // Show split sheet form for selected song
  return (
    <SplitSheetForm
      songId={selectedSongId}
      songTitle={selectedSongTitle}
      releaseId={releaseId}
      onBack={handleBackToSongSelector}
    />
  );
};
