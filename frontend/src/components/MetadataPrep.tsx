import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, Music, Save, Globe, Clock, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ReleaseDetails, Song } from "@/hooks/api/useReleaseDetails";
import { SplitSheetTemplate } from "@/components/split-sheet";
import { apiClient } from "@/lib/api";

type ActiveTemplate = "main" | "labelCopy" | "splitSheet" | "lyricSheet" | null;

interface MetadataPrepProps {
  releaseId?: string;
  existingRelease?: ReleaseDetails;
  existingSongs?: Song[];
  onBack?: () => void;
}

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
  versionSubtitle: string;
  subGenre: string;
  explicitContent: boolean;
}

interface LabelCopyTrackMetadata {
  track_number: number;
  duration_seconds?: number;
  isrc?: string;
  version_subtitle?: string;
  featured_artists?: string;
  explicit_content?: boolean;
  preview_start_time?: number;
  mix_engineer?: string;
  mastering_engineer?: string;
  remixer?: string;
  songwriters?: string;
  producers?: string;
  sub_genre?: string;
  language_lyrics?: string;
}

interface LabelCopyData {
  version_subtitle?: string;
  phonogram_copyright?: string;
  composition_copyright?: string;
  sub_genre?: string;
  territories?: string[] | string;
  explicit_content?: boolean;
  language_lyrics?: string;
  upc_code?: string;
  copyright_year?: number;
  tracks_metadata?: LabelCopyTrackMetadata[];
}

interface LabelCopyDraftData {
  releaseData: ReleaseData;
  tracks: Track[];
  savedAt?: string;
}

const DEFAULT_TRACKS: Track[] = [
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
];

export const MetadataPrep = ({ releaseId, existingRelease, existingSongs, onBack }: MetadataPrepProps = {}) => {
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
    description: "",
    versionSubtitle: "",
    subGenre: "",
    explicitContent: false
  });
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);

  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<{releaseData: ReleaseData; tracks: Track[]} | null>(null);
  const [restoredDraftAt, setRestoredDraftAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isLoadingLabelCopy, setIsLoadingLabelCopy] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const formatDraftTimestamp = useCallback((timestamp: string) => {
    const parsedDate = new Date(timestamp);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'just now';
    }

    return parsedDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }, []);

  // Helper function to convert seconds to MM:SS format
  const formatDuration = useCallback((seconds?: number): string => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Helper function to convert Song[] to Track[]
  const convertSongsToTracks = useCallback((songs: Song[]): Track[] => {
    return songs.map((song) => ({
      id: song.id,
      songTitle: song.song_title,
      trackNumber: song.track_number,
      duration: formatDuration(song.duration_seconds),
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
    }));
  }, [formatDuration]);

  // Helper function to merge Label Copy data with tracks
  const mergeLabelCopyWithTracks = useCallback((existingTracks: Track[], labelCopyTracks: LabelCopyTrackMetadata[]): Track[] => {
    return existingTracks.map((track) => {
      // Find matching track in label copy data by track number
      const labelCopyTrack = labelCopyTracks.find(lct => lct.track_number === track.trackNumber);
      
      if (labelCopyTrack) {
        return {
          ...track,
          duration: formatDuration(labelCopyTrack.duration_seconds) || track.duration,
          isrc: labelCopyTrack.isrc || track.isrc,
          versionSubtitle: labelCopyTrack.version_subtitle || track.versionSubtitle,
          featuredArtists: labelCopyTrack.featured_artists || track.featuredArtists,
          explicitContent: labelCopyTrack.explicit_content ?? track.explicitContent,
          previewStartTime: labelCopyTrack.preview_start_time ?? track.previewStartTime,
          mixEngineer: labelCopyTrack.mix_engineer || track.mixEngineer,
          masteringEngineer: labelCopyTrack.mastering_engineer || track.masteringEngineer,
          remixer: labelCopyTrack.remixer || track.remixer,
          songwriters: labelCopyTrack.songwriters || track.songwriters,
          producers: labelCopyTrack.producers || track.producers,
          subGenre: labelCopyTrack.sub_genre || track.subGenre,
          languageLyrics: labelCopyTrack.language_lyrics || track.languageLyrics
        };
      }
      
      return track;
    });
  }, [formatDuration]);

  // Fetch existing Label Copy data
  const fetchLabelCopyData = useCallback(async (releaseIdentifier: string): Promise<LabelCopyData | null> => {
    setIsLoadingLabelCopy(true);
    try {
      const response = await apiClient.getLabelCopy(releaseIdentifier);
      if (response.error || response.status !== 200) {
        return null;
      }

      const result = response.data as { success?: boolean; data?: LabelCopyData | null } | undefined;
      if (result?.success) {
        return result.data ?? null;
      }

      return null;
    } catch {
      // Don't show error toast for missing data - it's expected for new releases
      return null;
    } finally {
      setIsLoadingLabelCopy(false);
    }
  }, []);

  // Session storage key for auto-save
  const getSessionStorageKey = useCallback(() => `labelCopy_${releaseId || 'new'}`, [releaseId]);

  // Save form data to session storage
  const saveToSessionStorage = useCallback(() => {
    if (activeTemplate === 'labelCopy') {
      const formData: LabelCopyDraftData = {
        releaseData,
        tracks,
        savedAt: new Date().toISOString()
      };
      sessionStorage.setItem(getSessionStorageKey(), JSON.stringify(formData));
    }
  }, [activeTemplate, getSessionStorageKey, releaseData, tracks]);

  // Load form data from session storage
  const loadFromSessionStorage = useCallback(() => {
    if (activeTemplate === 'labelCopy') {
      const saved = sessionStorage.getItem(getSessionStorageKey());
      if (!saved) {
        setRestoredDraftAt(null);
        return;
      }

      if (saved) {
        try {
          const parsedData: unknown = JSON.parse(saved);
          if (typeof parsedData !== 'object' || parsedData === null) {
            return;
          }

          const formData = parsedData as Partial<LabelCopyDraftData>;

          if (formData.releaseData && Array.isArray(formData.tracks)) {
            setReleaseData(formData.releaseData);
            setTracks(formData.tracks);
            setRestoredDraftAt(formData.savedAt ?? new Date().toISOString());
          }
        } catch {
          // Ignore malformed session data and continue with current in-memory state
          return;
        }
      }
    }
  }, [activeTemplate, getSessionStorageKey]);

  // Check for unsaved changes
  const checkForUnsavedChanges = useCallback(() => {
    if (!lastSavedData) return false;
    return JSON.stringify({ releaseData, tracks }) !== JSON.stringify(lastSavedData);
  }, [lastSavedData, releaseData, tracks]);

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isReadOnly) {
      setIsReadOnly(false);
      // Start auto-save when entering edit mode
      startAutoSave();
    } else {
      // Check for unsaved changes before switching to read-only
      if (checkForUnsavedChanges()) {
        const confirmDiscard = window.confirm(
          'You have unsaved changes. Are you sure you want to discard them?'
        );
        if (!confirmDiscard) return;
      }
      setIsReadOnly(true);
      setHasUnsavedChanges(false);
      stopAutoSave();
    }
  };

  // Start auto-save interval
  const startAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }
    autoSaveIntervalRef.current = setInterval(() => {
      saveToSessionStorage();
    }, 3000); // Auto-save every 3 seconds
  }, [saveToSessionStorage]);

  // Stop auto-save interval
  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  // Pre-populate form data when props are provided
  useEffect(() => {
    const loadReleaseData = async () => {
      if (existingRelease && releaseId) {
        // First, populate basic release data from music_releases table
        const baseReleaseData = {
          releaseTitle: existingRelease.title || "",
          artist: "", // Will need to get from artist_profiles table
          releaseType: existingRelease.release_type || "",
          releaseDate: existingRelease.release_date || "",
          copyright: existingRelease.copyright_info || "",
          upc: existingRelease.upc_code || "",
          genre: existingRelease.genre || "",
          languageLyrics: "en", // Default
          phonogramCopyright: "",
          compositionCopyright: "",
          label: existingRelease.label || "",
          territories: "",
          description: existingRelease.description || "",
          versionSubtitle: "",
          subGenre: "",
          explicitContent: false
        };

        // Convert songs to tracks first
        const baseTracks = existingSongs && existingSongs.length > 0 
          ? convertSongsToTracks(existingSongs) 
          : DEFAULT_TRACKS;

        // Fetch existing Label Copy data and merge it
        const labelCopyData = await fetchLabelCopyData(releaseId);
        
        let finalReleaseData = baseReleaseData;
        let finalTracks = baseTracks;

        if (labelCopyData) {
          // Merge Label Copy data with base release data
          finalReleaseData = {
            ...baseReleaseData,
            versionSubtitle: labelCopyData.version_subtitle || baseReleaseData.versionSubtitle,
            phonogramCopyright: labelCopyData.phonogram_copyright || baseReleaseData.phonogramCopyright,
            compositionCopyright: labelCopyData.composition_copyright || baseReleaseData.compositionCopyright,
            subGenre: labelCopyData.sub_genre || baseReleaseData.subGenre,
            territories: Array.isArray(labelCopyData.territories) 
              ? labelCopyData.territories.join(', ') 
              : (labelCopyData.territories || baseReleaseData.territories),
            explicitContent: labelCopyData.explicit_content ?? baseReleaseData.explicitContent,
            languageLyrics: labelCopyData.language_lyrics || baseReleaseData.languageLyrics,
            upc: labelCopyData.upc_code || baseReleaseData.upc,
            copyright: labelCopyData.copyright_year ? labelCopyData.copyright_year.toString() : baseReleaseData.copyright
          };

          // Merge track metadata if it exists
          if (labelCopyData.tracks_metadata && Array.isArray(labelCopyData.tracks_metadata)) {
            finalTracks = mergeLabelCopyWithTracks(baseTracks, labelCopyData.tracks_metadata);
          }
        }

        setReleaseData(finalReleaseData);
        setTracks(finalTracks);
        
        // Set as read-only if this is an existing release
        setIsReadOnly(true);
        
        // Store as last saved data
        setLastSavedData({ releaseData: finalReleaseData, tracks: finalTracks });
      } else {
        // New release - start in edit mode
        setIsReadOnly(false);
        
        if (existingSongs && existingSongs.length > 0) {
          setTracks(convertSongsToTracks(existingSongs));
        }
      }
    };

    loadReleaseData();
  }, [convertSongsToTracks, existingRelease, existingSongs, fetchLabelCopyData, mergeLabelCopyWithTracks, releaseId]);

  // Handle template change and session storage
  useEffect(() => {
    if (activeTemplate === 'labelCopy') {
      // Load from session storage when entering label copy
      loadFromSessionStorage();
      
      // Start auto-save if in edit mode
      if (!isReadOnly) {
        startAutoSave();
      }
    } else {
      // Stop auto-save when leaving label copy
      stopAutoSave();
    }

    // Cleanup on unmount
    return () => {
      stopAutoSave();
    };
  }, [activeTemplate, isReadOnly, loadFromSessionStorage, startAutoSave, stopAutoSave]);

  // Track form changes for unsaved changes detection
  useEffect(() => {
    if (activeTemplate === 'labelCopy' && !isReadOnly) {
      setHasUnsavedChanges(checkForUnsavedChanges());
    }
  }, [activeTemplate, checkForUnsavedChanges, isReadOnly, releaseData, tracks]);

  // Handle beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && activeTemplate === 'labelCopy' && !isReadOnly) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, activeTemplate, isReadOnly]);

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

  const updateTrack = <K extends keyof Track>(trackId: string, field: K, value: Track[K]) => {
    if (!isReadOnly) {
      setTracks(tracks.map(track => 
        track.id === trackId ? { ...track, [field]: value } : track
      ));
    }
  };

  const updateReleaseData = (field: keyof ReleaseData, value: string | boolean) => {
    if (!isReadOnly) {
      setReleaseData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Helper function to convert MM:SS duration to seconds
  const parseDuration = (duration: string): number | undefined => {
    if (!duration) return undefined;
    const parts = duration.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return undefined;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds)) return undefined;
    return minutes * 60 + seconds;
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      // No validation - allow saving with any data

      // Get all tracks for saving (no validation)
      const tracksWithContent = tracks.filter(track => track.songTitle?.trim() || track.duration?.trim() || track.songwriters?.trim());

      // Determine if this is an update or create operation
      const isUpdate = releaseId && existingRelease;

      const normalizedReleaseType = (releaseData.releaseType || 'single') as 'single' | 'ep' | 'album' | 'mixtape';
      const parsedCopyrightYear = Number.parseInt(releaseData.copyright, 10);
      const copyrightYear = Number.isNaN(parsedCopyrightYear)
        ? new Date().getFullYear()
        : parsedCopyrightYear;
      const normalizedReleaseDate = releaseData.releaseDate || new Date().toISOString().slice(0, 10);
      
      // Create release payload with correct database field names
      const releasePayload = {
        title: releaseData.releaseTitle,
        release_type: normalizedReleaseType,
        release_date: normalizedReleaseDate,
        copyright_year: copyrightYear,
        upc: releaseData.upc,
        genre: releaseData.genre,
        language_lyrics: releaseData.languageLyrics,
        phonogram_copyright: releaseData.phonogramCopyright,
        composition_copyright: releaseData.compositionCopyright,
        label: releaseData.label,
        territories: releaseData.territories
          ? releaseData.territories.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        description: releaseData.description
      };
      
      let currentReleaseId = releaseId;
      
      if (isUpdate) {
        const response = await apiClient.updateRelease(releaseId, releasePayload);
        if (response.error || response.status !== 200) {
          throw new Error(response.error || 'Failed to update release');
        }
      } else {
        const response = await apiClient.createRelease(releasePayload);
        if (response.error || response.status !== 201) {
          throw new Error(response.error || 'Failed to create release');
        }

        const createdReleaseResponse = response.data as { success?: boolean; data?: { id?: string } } | undefined;
        currentReleaseId = createdReleaseResponse?.data?.id;
      }

      if (!currentReleaseId) {
        throw new Error('Release ID missing after save operation');
      }

      // Prepare tracks metadata for label copy
      const tracksMetadata = tracksWithContent.map(track => ({
        track_number: track.trackNumber,
        duration_seconds: parseDuration(track.duration),
        isrc: track.isrc,
        version_subtitle: track.versionSubtitle,
        featured_artists: track.featuredArtists,
        explicit_content: track.explicitContent,
        preview_start_time: track.previewStartTime,
        mix_engineer: track.mixEngineer,
        mastering_engineer: track.masteringEngineer,
        remixer: track.remixer,
        language_lyrics: track.languageLyrics,
        songwriters: track.songwriters,
        producers: track.producers,
        sub_genre: track.subGenre
      }));

      const labelCopyPayload = {
        version_subtitle: releaseData.versionSubtitle,
        phonogram_copyright: releaseData.phonogramCopyright,
        composition_copyright: releaseData.compositionCopyright,
        sub_genre: releaseData.subGenre,
        territories: releaseData.territories ? releaseData.territories.split(',').map(t => t.trim()) : [],
        explicit_content: releaseData.explicitContent || false,
        language_lyrics: releaseData.languageLyrics,
        upc_code: releaseData.upc,
        copyright_year: Number.isNaN(parsedCopyrightYear) ? undefined : parsedCopyrightYear,
        tracks_metadata: tracksMetadata
      };

      const labelCopyResponse = await apiClient.saveLabelCopy(currentReleaseId, labelCopyPayload);

      if (labelCopyResponse.error || labelCopyResponse.status !== 200) {
        throw new Error(labelCopyResponse.error || 'Failed to save Label Copy data');
      }

      // Clear session storage on successful save
      sessionStorage.removeItem(getSessionStorageKey());
      setRestoredDraftAt(null);
      
      // Update last saved data
      setLastSavedData({ releaseData, tracks });
      setHasUnsavedChanges(false);
      
      // Set to read-only mode after successful save
      setIsReadOnly(true);
      stopAutoSave();
      
      // Set success status for immediate feedback
      setSaveStatus('success');
      
      toast({
        title: "Label Copy Saved Successfully",
        description: `Label Copy saved successfully to database. Release "${releaseData.releaseTitle}" with ${tracks.length} track${tracks.length !== 1 ? 's' : ''} has been ${isUpdate ? 'updated' : 'saved'}.`,
      });
      
      // Clear success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      // Only reset form if creating new (not updating)
      if (!isUpdate) {
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
          description: "",
          versionSubtitle: "",
          subGenre: "",
          explicitContent: false
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
      }

    } catch {
      setSaveStatus('error');
      
      toast({
        title: "Save Failed",
        description: "Label Copy not saved, please try again or contact customer support at +1(432)640-7688.",
        variant: "destructive"
      });
      
      // Clear error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
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
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Label Copy Template</h2>
                <p className="text-muted-foreground">
                  {releaseId && existingRelease 
                    ? `Updating metadata for "${existingRelease.title}"`
                    : "Complete metadata for distribution"
                  }
                </p>
                {isLoadingLabelCopy && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading saved data...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {releaseId && existingRelease ? (
                  <>
                    {isReadOnly ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">View Mode</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Editing Mode</span>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditToggle}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      {isReadOnly ? 'Edit Label Copy' : 'Cancel Edit'}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">Create Mode</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {restoredDraftAt && (
          <div className="flex flex-col gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-emerald-700" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Draft restored from this device</p>
                <p className="text-xs text-emerald-700">Last autosave: {formatDraftTimestamp(restoredDraftAt)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRestoredDraftAt(null)}
              className="h-8 justify-start px-2 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 sm:justify-center"
            >
              Dismiss
            </Button>
          </div>
        )}

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
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseType">Release Type *</Label>
                <Select value={releaseData.releaseType} onValueChange={(value) => updateReleaseData('releaseType', value)} disabled={isReadOnly}>
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
                  type="date"
                  value={releaseData.releaseDate}
                  onChange={(e) => setReleaseData({ ...releaseData, releaseDate: e.target.value })}
                  disabled={isReadOnly}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Year *</Label>
                <Input
                  value={releaseData.copyright}
                  onChange={(e) => setReleaseData({ ...releaseData, copyright: e.target.value })}
                  disabled={isReadOnly}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upc">UPC Code</Label>
                <Input
                  value={releaseData.upc}
                  onChange={(e) => setReleaseData({ ...releaseData, upc: e.target.value })}
                  disabled={isReadOnly}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Primary Genre *</Label>
                <Select value={releaseData.genre} onValueChange={(value) => updateReleaseData('genre', value)} disabled={isReadOnly}>
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
                <Label htmlFor="subGenre">Sub-Genre</Label>
                <Input 
                  id="subGenre" 
                  value={releaseData.subGenre}
                  onChange={(e) => updateReleaseData('subGenre', e.target.value)}
                  placeholder="Dance Pop, Alternative Rock" 
                  className="w-full" 
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languageLyrics">Primary Language</Label>
                <Select value={releaseData.languageLyrics} onValueChange={(value) => updateReleaseData('languageLyrics', value)} disabled={isReadOnly}>
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
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="versionSubtitle">Version Subtitle</Label>
                <Input 
                  id="versionSubtitle" 
                  value={releaseData.versionSubtitle}
                  onChange={(e) => updateReleaseData('versionSubtitle', e.target.value)}
                  placeholder="Deluxe Edition, Remastered" 
                  className="w-full" 
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Record Label</Label>
                <Input 
                  id="label" 
                  value={releaseData.label}
                  onChange={(e) => updateReleaseData('label', e.target.value)}
                  placeholder="Independent / Label name" 
                  className="w-full" 
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Release Description</Label>
                <Textarea 
                  id="description" 
                  value={releaseData.description}
                  onChange={(e) => updateReleaseData('description', e.target.value)}
                  placeholder="Brief description of the release for promotional use..."
                  rows={3}
                  className="w-full"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Content Rating</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="explicitContent"
                    checked={releaseData.explicitContent}
                    onCheckedChange={(checked) => updateReleaseData('explicitContent', checked === true)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="explicitContent" className="text-sm font-medium">
                    Explicit Content (Release-level)
                  </Label>
                </div>
              </div>
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
            {tracks.map((track) => (
              <div key={track.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold">Track {track.trackNumber}</h4>
                  {tracks.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeTrack(track.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isReadOnly}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Basic Track Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Song Title</Label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 w-full">
                        {track.songTitle || "Untitled Track"}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        Edit in Songs tab
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Input 
                      value={track.duration}
                      onChange={(e) => updateTrack(track.id, 'duration', e.target.value)}
                      placeholder="3:45" 
                      className="w-full" 
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ISRC Code</Label>
                    <Input 
                      value={track.isrc}
                      onChange={(e) => updateTrack(track.id, 'isrc', e.target.value)}
                      placeholder="US-XXX-XX-XXXXX" 
                      className="w-full" 
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Featured Artists</Label>
                    <Input 
                      value={track.featuredArtists}
                      onChange={(e) => updateTrack(track.id, 'featuredArtists', e.target.value)}
                      placeholder="Artist Name, Another Artist" 
                      className="w-full" 
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Producers</Label>
                    <Input 
                      value={track.producers}
                      onChange={(e) => updateTrack(track.id, 'producers', e.target.value)}
                      placeholder="Producer names" 
                      className="w-full" 
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mastering Engineer</Label>
                    <Input 
                      value={track.masteringEngineer}
                      onChange={(e) => updateTrack(track.id, 'masteringEngineer', e.target.value)}
                      placeholder="Engineer name" 
                      className="w-full" 
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Remixer</Label>
                    <Input 
                      value={track.remixer}
                      onChange={(e) => updateTrack(track.id, 'remixer', e.target.value)}
                      placeholder="Remixer name" 
                      className="w-full" 
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id={`explicit-${track.id}`}
                      checked={track.explicitContent}
                      onCheckedChange={(checked) => updateTrack(track.id, 'explicitContent', checked === true)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor={`explicit-${track.id}`} className="text-sm font-medium">
                      Explicit Content (Track-level)
                    </Label>
                  </div>
                </div>
              </div>
            ))}

            <Button 
              onClick={addTrack}
              variant="outline" 
              className="w-full"
              disabled={isReadOnly}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Track
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3 pt-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleSave}
              disabled={isLoading || isReadOnly}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Label Copy'}
            </Button>
            <Button variant="outline">Export to PDF</Button>
          </div>
          
          {/* Save Status Feedback */}
          {saveStatus !== 'idle' && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
              saveStatus === 'saving' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              saveStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              saveStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                saveStatus === 'saving' ? 'bg-blue-500 animate-pulse' :
                saveStatus === 'success' ? 'bg-green-500' :
                saveStatus === 'error' ? 'bg-red-500' : ''
              }`}></div>
              {saveStatus === 'saving' && 'Saving Label Copy to database...'}
              {saveStatus === 'success' && 'Label Copy saved successfully to database!'}
              {saveStatus === 'error' && 'Save failed - please try again or contact support at +1(432)640-7688'}
            </div>
          )}
        </div>
      </div>
    );
  }


  if (activeTemplate === "splitSheet") {
    return (
      <SplitSheetTemplate 
        releaseId={releaseId}
        existingSongs={existingSongs}
        onBack={() => setActiveTemplate("main")}
      />
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

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        <div>
          <h2 className="text-3xl font-bold">Metadata Management</h2>
          <p className="text-muted-foreground mt-2">
            Streamline your track metadata for all DSPs
          </p>
        </div>
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