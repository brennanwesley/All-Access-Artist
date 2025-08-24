import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Edit, Plus, Users, Percent } from "lucide-react";
import { ContributorRow } from "./ContributorRow";
import { PercentageValidator } from "./PercentageValidator";
import { useContributors } from "./hooks/useContributors";
import { usePercentageValidation } from "./hooks/usePercentageValidation";
import { useSplitSheet } from "./hooks/useSplitSheet";
import { SplitSheetData } from "./types";

interface SplitSheetFormProps {
  songId: string;
  songTitle: string;
  releaseId?: string | undefined;
  onBack: () => void;
}

export const SplitSheetForm = ({ songId, songTitle, releaseId, onBack }: SplitSheetFormProps) => {
  const {
    splitSheetData,
    isLoading,
    isReadOnly,
    hasUnsavedChanges,
    startEditing,
    stopEditing,
    updateSplitSheetData,
    saveSplitSheet,
  } = useSplitSheet({ songId, songTitle, releaseId });

  const {
    contributors,
    updateContributor,
    addContributor,
    removeContributor,
    resetContributors,
    canAddMore,
    canRemove,
  } = useContributors(splitSheetData?.contributors || []);

  const validation = usePercentageValidation(contributors);

  // Local form state
  const [formData, setFormData] = useState<Partial<SplitSheetData>>({
    song_title: songTitle,
    song_aka: '',
    artist_name: '',
    album_project: '',
    date_created: '',
    song_length: '',
    studio_location: '',
    additional_notes: '',
  });

  // Update form data when split sheet data loads
  useEffect(() => {
    if (splitSheetData) {
      setFormData({
        song_title: songTitle, // Always use the selected song title, not the stored one
        artist_name: splitSheetData.artist_name || '',
        album_project: splitSheetData.album_project || '',
        song_aka: splitSheetData.song_aka || '',
        date_created: splitSheetData.date_created || '',
        song_length: splitSheetData.song_length || '',
        studio_location: splitSheetData.studio_location || '',
        additional_notes: splitSheetData.additional_notes || '',
      });
      resetContributors(splitSheetData.contributors);
    }
  }, [splitSheetData, resetContributors, songTitle]);

  // Update split sheet data when contributors change
  useEffect(() => {
    if (!isReadOnly) {
      updateSplitSheetData({ contributors });
    }
  }, [contributors, isReadOnly, updateSplitSheetData]);

  const handleFormFieldChange = (field: keyof SplitSheetData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!isReadOnly) {
      updateSplitSheetData({ [field]: value });
    }
  };

  const handleSave = async () => {
    if (!validation.isValid) return;
    
    const dataToSave: SplitSheetData = {
      ...formData,
      song_title: songTitle,
      contributors,
      release_id: releaseId,
    } as SplitSheetData;

    await saveSplitSheet(dataToSave);
  };

  const handleEdit = () => {
    startEditing();
  };

  const handleCancel = () => {
    stopEditing();
    // Reset form data to last saved state
    if (splitSheetData) {
      setFormData({
        song_title: splitSheetData.song_title,
        artist_name: splitSheetData.artist_name || '',
        album_project: splitSheetData.album_project || '',
        song_aka: splitSheetData.song_aka || '',
        date_created: splitSheetData.date_created || '',
        song_length: splitSheetData.song_length || '',
        studio_location: splitSheetData.studio_location || '',
        additional_notes: splitSheetData.additional_notes || '',
      });
      resetContributors(splitSheetData.contributors);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-3xl font-bold">Split Sheet Template</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading split sheet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Split Sheet Template</h2>
              <p className="text-muted-foreground">
                {splitSheetData?.id 
                  ? `Editing split sheet for "${songTitle}"`
                  : `Creating split sheet for "${songTitle}"`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isReadOnly ? (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    View Mode
                  </span>
                  <Button onClick={handleEdit} size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Split Sheet
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Editing Mode
                  </span>
                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-600">Unsaved changes</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
          {/* Song Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="songTitle">Song Title *</Label>
              <Input 
                id="songTitle" 
                value={formData.song_title || ''}
                onChange={(e) => handleFormFieldChange('song_title', e.target.value)}
                placeholder="Enter song title" 
                className="w-full" 
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="songAka">Song AKA (Alternate Titles)</Label>
              <Input 
                id="songAka" 
                value={formData.song_aka || ''}
                onChange={(e) => handleFormFieldChange('song_aka', e.target.value)}
                placeholder="Working titles, alternate names" 
                className="w-full" 
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist Name *</Label>
              <Input 
                id="artistName" 
                value={formData.artist_name || ''}
                onChange={(e) => handleFormFieldChange('artist_name', e.target.value)}
                placeholder="Enter artist name" 
                className="w-full" 
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="albumProject">Album/Project</Label>
              <Input 
                id="albumProject" 
                placeholder="Album or project name"
                value={formData.album_project || ''}
                onChange={(e) => handleFormFieldChange('album_project', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date Created</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.date_created || ''}
                onChange={(e) => handleFormFieldChange('date_created', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="songLength">Song Length</Label>
              <Input 
                id="songLength" 
                placeholder="MM:SS"
                value={formData.song_length || ''}
                onChange={(e) => handleFormFieldChange('song_length', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studioLocation">Studio/Location of Creation</Label>
            <Input 
              id="studioLocation" 
              placeholder="Where the song was created"
              value={formData.studio_location || ''}
              onChange={(e) => handleFormFieldChange('studio_location', e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          {/* Contributors Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              <Label className="text-base font-semibold">Writer Credits & Splits</Label>
            </div>
            
            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-3">
              <div className="col-span-3">Legal Name</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Writer %</div>
              <div className="col-span-2">Publisher %</div>
              <div className="col-span-2">PRO/Publisher</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Contributors */}
            <div className="space-y-2">
              {contributors.map((contributor, index) => (
                <ContributorRow
                  key={index}
                  contributor={contributor}
                  index={index}
                  onChange={updateContributor}
                  onRemove={removeContributor}
                  canRemove={canRemove}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
            
            {/* Add Writer Button */}
            {!isReadOnly && canAddMore && (
              <Button variant="outline" size="sm" onClick={addContributor}>
                <Plus className="mr-2 h-4 w-4" />
                Add Writer
              </Button>
            )}

            {/* Percentage Validation */}
            <PercentageValidator validation={validation} />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any additional terms, agreements, or notes about the splits..."
              rows={3}
              value={formData.additional_notes || ''}
              onChange={(e) => handleFormFieldChange('additional_notes', e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This split sheet serves as a working document. 
              All parties should review and agree to these terms before finalizing. 
              Consider having this document reviewed by legal counsel for official agreements.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {isReadOnly ? (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Split Sheet
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={!validation.isValid}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Split Sheet
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
            <Button variant="outline" disabled>
              Export to PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
