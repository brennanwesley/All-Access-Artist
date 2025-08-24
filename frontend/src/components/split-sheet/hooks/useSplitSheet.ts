import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SplitSheetData } from "../types";
import { apiClient } from "@/lib/api";

interface UseSplitSheetProps {
  songId: string;
  songTitle: string;
  releaseId?: string | undefined;
}

export const useSplitSheet = ({ songId, songTitle, releaseId }: UseSplitSheetProps) => {
  const [splitSheetData, setSplitSheetData] = useState<SplitSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<SplitSheetData | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const sessionStorageKey = `splitSheet_${songId || 'unknown'}`;

  // Load existing split sheet data
  const loadSplitSheet = useCallback(async () => {
    if (!songId) {
      console.warn('No songId provided to loadSplitSheet');
      return;
    }
    
    setIsLoading(true);
    try {
      // Try to load existing split sheet from API
      const response = await apiClient.getSplitSheet(songId);
      
      if (response.data && response.status === 200) {
        // Backend returns { success: true, data: splitSheetData }
        const splitSheetData = response.data.data;
        if (splitSheetData) {
          setSplitSheetData(splitSheetData);
          setLastSavedData(splitSheetData);
          console.log('Split sheet data loaded successfully:', splitSheetData);
          return;
        }
      }

      // If no existing data, create empty data structure
      const emptyData: SplitSheetData = {
        song_title: songTitle,
        artist_name: '',
        album_project: '',
        date_created: new Date().toISOString().split('T')[0],
        contributors: [],
      };
      
      // Only add release_id if it exists
      if (releaseId) {
        emptyData.release_id = releaseId;
      }
      setSplitSheetData(emptyData);
      setLastSavedData(emptyData);
    } catch (error) {
      console.error('Error loading split sheet:', error);
      toast({
        title: "Load Failed",
        description: "Split Sheet data could not be loaded, please try again or contact customer support at +1(432)640-7688.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [songId, songTitle, releaseId, toast]);

  // Save split sheet data
  const saveSplitSheet = useCallback(async (data: SplitSheetData) => {
    if (!songId) {
      console.error('No songId provided to saveSplitSheet');
      toast({
        title: "Error",
        description: "No song ID available for saving",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save to backend API
      const response = await apiClient.saveSplitSheet(songId, data);
      
      if (response.error || response.status !== 200) {
        console.error('Split Sheet API Error:', response);
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
      
      toast({
        title: "Split Sheet Saved Successfully",
        description: `Split Sheet saved successfully to database. Song "${data.song_title}" split sheet has been saved.`,
      });
    } catch (error) {
      console.error('Error saving split sheet:', error);
      toast({
        title: "Save Failed",
        description: "Split Sheet not saved, please try again or contact customer support at +1(432)640-7688.",
        variant: "destructive",
      });
    }
  }, [songId, sessionStorageKey, toast]);

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
        console.error('Error parsing session storage data:', error);
      }
    }

    // Start auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      if (splitSheetData) {
        autoSave(splitSheetData);
      }
    }, 3000); // 3 seconds
  }, [sessionStorageKey, splitSheetData, autoSave]);

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
