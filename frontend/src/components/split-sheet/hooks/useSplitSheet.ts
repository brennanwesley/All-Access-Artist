import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Contributor, SplitSheetData } from "../types";
import { apiClient } from "@/lib/api";
import { logger } from "@/lib/logger";
import type {
  BackendResponse,
  CreateSplitSheetData,
  SplitSheet,
  SplitSheetContributor,
} from "@/types/api";

interface UseSplitSheetProps {
  songId: string;
  songTitle: string;
  releaseId?: string | undefined;
}

const mapContributorToApi = (contributor: Contributor): SplitSheetContributor => ({
  legal_name: contributor.legal_name,
  role: contributor.role,
  writer_share_percent: contributor.writer_share_percent,
  publisher_share_percent: contributor.publisher_share_percent,
  ...(contributor.stage_name ? { stage_name: contributor.stage_name } : {}),
  ...(contributor.contribution ? { contribution: contributor.contribution } : {}),
  ...(contributor.pro_affiliation ? { pro_affiliation: contributor.pro_affiliation } : {}),
  ...(contributor.ipi_number ? { ipi_number: contributor.ipi_number } : {}),
  ...(contributor.publisher
    ? {
        publisher: {
          ...(contributor.publisher.company_name
            ? { company_name: contributor.publisher.company_name }
            : {}),
          ...(contributor.publisher.pro_affiliation
            ? { pro_affiliation: contributor.publisher.pro_affiliation }
            : {}),
          ...(contributor.publisher.ipi_number
            ? { ipi_number: contributor.publisher.ipi_number }
            : {}),
        },
      }
    : {}),
});

const mapApiContributorToLocal = (contributor: SplitSheetContributor): Contributor => ({
  legal_name: contributor.legal_name,
  role: contributor.role,
  writer_share_percent: contributor.writer_share_percent,
  publisher_share_percent: contributor.publisher_share_percent,
  ...(contributor.stage_name ? { stage_name: contributor.stage_name } : {}),
  ...(contributor.contribution ? { contribution: contributor.contribution } : {}),
  ...(contributor.pro_affiliation ? { pro_affiliation: contributor.pro_affiliation } : {}),
  ...(contributor.ipi_number ? { ipi_number: contributor.ipi_number } : {}),
  ...(contributor.publisher
    ? {
        publisher: {
          ...(contributor.publisher.company_name
            ? { company_name: contributor.publisher.company_name }
            : {}),
          ...(contributor.publisher.pro_affiliation
            ? { pro_affiliation: contributor.publisher.pro_affiliation }
            : {}),
          ...(contributor.publisher.ipi_number
            ? { ipi_number: contributor.publisher.ipi_number }
            : {}),
        },
      }
    : {}),
});

const mapSplitSheetToCreatePayload = (data: SplitSheetData): CreateSplitSheetData => ({
  song_title: data.song_title,
  artist_name: data.artist_name,
  album_project: data.album_project,
  date_created: data.date_created,
  contributors: data.contributors.map(mapContributorToApi),
  ...(data.song_aka ? { song_aka: data.song_aka } : {}),
  ...(data.song_length ? { song_length: data.song_length } : {}),
  ...(data.studio_location ? { studio_location: data.studio_location } : {}),
  ...(data.additional_notes ? { additional_notes: data.additional_notes } : {}),
  ...(data.release_id ? { release_id: data.release_id } : {}),
});

export const useSplitSheet = ({ songId, songTitle, releaseId }: UseSplitSheetProps) => {
  const [splitSheetData, setSplitSheetData] = useState<SplitSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<SplitSheetData | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionStorageKey = `splitSheet_${songId || 'unknown'}`;

  // Load existing split sheet data
  const loadSplitSheet = useCallback(async () => {
    if (!songId) {
      logger.warn('No songId provided to load split sheet');
      return;
    }
    
    setIsLoading(true);
    try {
      // Try to load existing split sheet from API
      const response = await apiClient.getSplitSheet(songId);
      const backendResponse = response.data as BackendResponse<SplitSheet> | undefined;
      
      if (response.status === 200 && backendResponse?.success) {
        const splitSheet = backendResponse.data;

        if (splitSheet) {
          const hydratedSplitSheet: SplitSheetData = {
            ...splitSheet,
            album_project: splitSheet.album_project ?? '',
            date_created: splitSheet.date_created ?? new Date().toISOString().substring(0, 10),
            contributors: splitSheet.contributors.map(mapApiContributorToLocal),
            ...(splitSheet.release_id ? { release_id: splitSheet.release_id } : {}),
          };

          setSplitSheetData(hydratedSplitSheet);
          setLastSavedData(hydratedSplitSheet);
          return;
        }
      }

      // If no existing data, create empty data structure
      const emptyData: SplitSheetData = {
        song_title: songTitle,
        artist_name: '',
        album_project: '',
        date_created: new Date().toISOString().substring(0, 10),
        contributors: [],
      };
      
      // Only add release_id if it exists
      if (releaseId) {
        emptyData.release_id = releaseId;
      }
      setSplitSheetData(emptyData);
      setLastSavedData(emptyData);
    } catch (error) {
      logger.error('Error loading split sheet', { songId, error });
      toast.error("Load Failed", {
        description: "Split Sheet data could not be loaded, please try again or contact customer support at +1(432)640-7688.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [songId, songTitle, releaseId]);

  // Save split sheet data
  const saveSplitSheet = useCallback(async (data: SplitSheetData) => {
    if (!songId) {
      logger.error('No songId provided to save split sheet');
      toast.error("Error", {
        description: "No song ID available for saving",
      });
      return;
    }
    
    try {
      // Save to backend API
      const payload = mapSplitSheetToCreatePayload(data);
      const response = await apiClient.saveSplitSheet(songId, payload);
      
      if (response.error || response.status !== 200) {
        logger.error('Split sheet API returned an error', {
          songId,
          status: response.status,
          error: response.error,
        });
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : JSON.stringify(response.error) || 'Failed to save split sheet';
        throw new Error(errorMessage);
      }

      setLastSavedData(data);
      setHasUnsavedChanges(false);
      setIsReadOnly(true);
      
      // Clear session storage
      sessionStorage.removeItem(sessionStorageKey);
      
      toast.success("Split Sheet Saved Successfully", {
        description: `Split Sheet saved successfully to database. Song "${data.song_title}" split sheet has been saved.`,
      });
    } catch (error) {
      logger.error('Error saving split sheet', { songId, error });
      toast.error("Save Failed", {
        description: "Split Sheet not saved, please try again or contact customer support at +1(432)640-7688.",
      });
    }
  }, [songId, sessionStorageKey]);

  // Auto-save to session storage
  const autoSave = useCallback((data: SplitSheetData) => {
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(data));
  }, [sessionStorageKey]);

  // Start editing mode
  const startEditing = useCallback(() => {
    setIsReadOnly(false);
    
    // Load from session storage if available
    const savedData = sessionStorage.getItem(sessionStorageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setSplitSheetData(parsedData);
      } catch (error) {
        logger.warn('Error parsing split sheet session storage data', { songId, error });
      }
    }

    // Start auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      if (splitSheetData) {
        autoSave(splitSheetData);
      }
    }, 3000); // 3 seconds
  }, [sessionStorageKey, splitSheetData, autoSave, songId]);

  // Stop editing mode
  const stopEditing = useCallback(() => {
    setIsReadOnly(true);
    setHasUnsavedChanges(false);
    
    // Clear auto-save interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    
    // Reset to last saved data
    if (lastSavedData) {
      setSplitSheetData(lastSavedData);
    }
    
    // Clear session storage
    sessionStorage.removeItem(sessionStorageKey);
  }, [lastSavedData, sessionStorageKey]);

  // Update split sheet data
  const updateSplitSheetData = useCallback((updates: Partial<SplitSheetData>) => {
    setSplitSheetData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  // Browser warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSplitSheet();
  }, [loadSplitSheet]);

  return {
    splitSheetData,
    isLoading,
    isReadOnly,
    hasUnsavedChanges,
    startEditing,
    stopEditing,
    updateSplitSheetData,
    saveSplitSheet,
    reload: loadSplitSheet,
  };
};
