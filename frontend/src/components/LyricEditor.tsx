import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Loader2, Edit2, Trash2, Music } from 'lucide-react'
import { Song } from '@/hooks/api/useReleaseDetail'
import { 
  useGetLyricSheet, 
  useCreateLyricSheet,
  useAddLyricSection, 
  useUpdateLyricSection, 
  useDeleteLyricSection,
  LyricSection 
} from '@/hooks/api/useLyricSheet'
import { toast } from 'sonner'

interface LyricEditorProps {
  songs: Song[]
}

const SECTION_TYPES = [
  { value: 'verse', label: 'Verse' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'pre-chorus', label: 'Pre-Chorus' },
  { value: 'intro', label: 'Intro' },
  { value: 'outro', label: 'Outro' },
  { value: 'other', label: 'Other' },
] as const

export const LyricEditor = ({ songs }: LyricEditorProps) => {
  const [selectedSongId, setSelectedSongId] = useState<string>('')
  const [editingSection, setEditingSection] = useState<LyricSection | null>(null)
  const [newSectionType, setNewSectionType] = useState<LyricSection['section_type']>('verse')
  const [newSectionContent, setNewSectionContent] = useState('')
  const [editSectionType, setEditSectionType] = useState<LyricSection['section_type']>('verse')
  const [editSectionContent, setEditSectionContent] = useState('')

  // Hooks for lyric sheet operations
  const { data: lyricSheet, isLoading, error } = useGetLyricSheet(selectedSongId)
  const createLyricSheetMutation = useCreateLyricSheet()
  const addSectionMutation = useAddLyricSection()
  const updateSectionMutation = useUpdateLyricSection()
  const deleteSectionMutation = useDeleteLyricSection()

  // Reset form when song changes
  useEffect(() => {
    setEditingSection(null)
    setNewSectionContent('')
    setNewSectionType('verse')
  }, [selectedSongId])

  const selectedSong = songs.find(song => song.id === selectedSongId)

  const handleCreateLyricSheet = () => {
    if (!selectedSong) return

    createLyricSheetMutation.mutate({
      songId: selectedSong.id,
      lyricData: {
        title: `${selectedSong.title} - Lyrics`,
        language: 'en',
        notes: ''
      }
    })
  }

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSongId || !newSectionContent.trim()) {
      toast.error('Please enter section content')
      return
    }

    const nextOrder = lyricSheet?.sections ? Math.max(0, ...lyricSheet.sections.map(s => s.section_order)) + 1 : 0

    addSectionMutation.mutate({
      songId: selectedSongId,
      sectionData: {
        section_type: newSectionType,
        section_order: nextOrder,
        content: newSectionContent.trim()
      }
    }, {
      onSuccess: () => {
        setNewSectionContent('')
        setNewSectionType('verse')
      }
    })
  }

  const handleEditSection = (section: LyricSection) => {
    setEditingSection(section)
    setEditSectionType(section.section_type)
    setEditSectionContent(section.content)
  }

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingSection || !editSectionContent.trim()) {
      toast.error('Please enter section content')
      return
    }

    updateSectionMutation.mutate({
      sectionId: editingSection.id,
      sectionData: {
        section_type: editSectionType,
        content: editSectionContent.trim()
      },
      songId: selectedSongId
    }, {
      onSuccess: () => {
        setEditingSection(null)
        setEditSectionContent('')
        setEditSectionType('verse')
      }
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this lyric section? This action cannot be undone.')) {
      deleteSectionMutation.mutate({
        sectionId,
        songId: selectedSongId
      })
    }
  }

  const getSectionTypeLabel = (type: LyricSection['section_type']) => {
    return SECTION_TYPES.find(t => t.value === type)?.label || type
  }

  // Sort sections by order
  const sortedSections = lyricSheet?.sections ? [...lyricSheet.sections].sort((a, b) => a.section_order - b.section_order) : []

  return (
    <div className="space-y-6">
      {/* Song Selection */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lyric Editor
          </CardTitle>
          <CardDescription>
            Select a song to view and edit its lyrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="song-select">Select Song</Label>
              <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a song to edit lyrics..." />
                </SelectTrigger>
                <SelectContent>
                  {songs.map((song) => (
                    <SelectItem key={song.id} value={song.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {song.track_number}
                        </Badge>
                        {song.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {songs.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No songs available. Add songs to this release first.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lyric Sheet Content */}
      {selectedSongId && (
        <>
          {isLoading && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading lyric sheet...</span>
              </CardContent>
            </Card>
          )}

          {error && !isLoading && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No lyric sheet found for this song.</p>
                <Button onClick={handleCreateLyricSheet} disabled={createLyricSheetMutation.isPending}>
                  {createLyricSheetMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Lyric Sheet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {lyricSheet && !isLoading && (
            <>
              {/* Add New Section Form */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Section
                  </CardTitle>
                  <CardDescription>
                    Add a new lyric section to "{selectedSong?.title}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddSection} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="section-type">Section Type</Label>
                        <Select value={newSectionType} onValueChange={(value) => setNewSectionType(value as LyricSection['section_type'])}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3">
                        <Label htmlFor="section-content">Lyrics</Label>
                        <Textarea
                          id="section-content"
                          placeholder="Enter lyrics for this section..."
                          value={newSectionContent}
                          onChange={(e) => setNewSectionContent(e.target.value)}
                          disabled={addSectionMutation.isPending}
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={addSectionMutation.isPending || !newSectionContent.trim()}
                      className="w-full md:w-auto"
                    >
                      {addSectionMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding Section...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Section
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Sections */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Lyric Sections ({sortedSections.length})
                  </CardTitle>
                  <CardDescription>
                    Manage the lyric sections for "{selectedSong?.title}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sortedSections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No lyric sections added yet.</p>
                      <p className="text-sm">Add your first section using the form above.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedSections.map((section) => (
                        <div key={section.id}>
                          {editingSection?.id === section.id ? (
                            // Edit Form
                            <form onSubmit={handleUpdateSection} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <Label htmlFor="edit-section-type">Section Type</Label>
                                    <Select value={editSectionType} onValueChange={(value) => setEditSectionType(value as LyricSection['section_type'])}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {SECTION_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="md:col-span-3">
                                    <Label htmlFor="edit-section-content">Lyrics</Label>
                                    <Textarea
                                      id="edit-section-content"
                                      value={editSectionContent}
                                      onChange={(e) => setEditSectionContent(e.target.value)}
                                      disabled={updateSectionMutation.isPending}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    type="submit" 
                                    size="sm"
                                    disabled={updateSectionMutation.isPending || !editSectionContent.trim()}
                                  >
                                    {updateSectionMutation.isPending ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      'Save Changes'
                                    )}
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setEditingSection(null)}
                                    disabled={updateSectionMutation.isPending}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </form>
                          ) : (
                            // Display Mode
                            <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                              <div className="flex items-start justify-between mb-3">
                                <Badge variant="outline" className="capitalize">
                                  {getSectionTypeLabel(section.section_type)}
                                </Badge>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSection(section)}
                                    disabled={updateSectionMutation.isPending || deleteSectionMutation.isPending}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSection(section.id)}
                                    disabled={updateSectionMutation.isPending || deleteSectionMutation.isPending}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {section.content}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
