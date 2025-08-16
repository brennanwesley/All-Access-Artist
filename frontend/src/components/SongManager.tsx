import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Music, Plus, Loader2, Edit2, Trash2 } from 'lucide-react'
import { useAddSong, useUpdateSong, useDeleteSong, Song } from '@/hooks/api/useReleaseDetail'
import { toast } from 'sonner'

interface SongManagerProps {
  releaseId: string
  songs: Song[]
}

export const SongManager = ({ releaseId, songs }: SongManagerProps) => {
  const [newSongTitle, setNewSongTitle] = useState('')
  const [newSongDuration, setNewSongDuration] = useState('')
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDuration, setEditDuration] = useState('')

  const addSongMutation = useAddSong()
  const updateSongMutation = useUpdateSong()
  const deleteSongMutation = useDeleteSong()

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newSongTitle.trim()) {
      toast.error('Please enter a song title')
      return
    }

    const nextTrackNumber = Math.max(0, ...songs.map(s => s.track_number)) + 1
    const duration = newSongDuration ? parseInt(newSongDuration) : undefined

    const songData: { title: string; track_number: number; duration?: number } = {
      title: newSongTitle.trim(),
      track_number: nextTrackNumber
    }
    
    if (duration !== undefined) {
      songData.duration = duration
    }

    addSongMutation.mutate({
      releaseId,
      songData
    }, {
      onSuccess: () => {
        setNewSongTitle('')
        setNewSongDuration('')
      }
    })
  }

  const handleEditSong = (song: Song) => {
    setEditingSong(song)
    setEditTitle(song.title)
    setEditDuration(song.duration ? song.duration.toString() : '')
  }

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingSong || !editTitle.trim()) {
      toast.error('Please enter a song title')
      return
    }

    const duration = editDuration ? parseInt(editDuration) : undefined

    const songData: Partial<Song> = {
      title: editTitle.trim()
    }
    
    if (duration !== undefined) {
      songData.duration = duration
    }

    updateSongMutation.mutate({
      songId: editingSong.id,
      songData
    }, {
      onSuccess: () => {
        setEditingSong(null)
        setEditTitle('')
        setEditDuration('')
      }
    })
  }

  const handleDeleteSong = (songId: string) => {
    if (confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
      deleteSongMutation.mutate(songId)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Sort songs by track number
  const sortedSongs = [...songs].sort((a, b) => a.track_number - b.track_number)

  return (
    <div className="space-y-6">
      {/* Add New Song Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Song
          </CardTitle>
          <CardDescription>
            Add a new track to this release
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSong} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="song-title">Song Title</Label>
                <Input
                  id="song-title"
                  type="text"
                  placeholder="Enter song title..."
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  disabled={addSongMutation.isPending}
                />
              </div>
              <div>
                <Label htmlFor="song-duration">Duration (seconds)</Label>
                <Input
                  id="song-duration"
                  type="number"
                  placeholder="180"
                  value={newSongDuration}
                  onChange={(e) => setNewSongDuration(e.target.value)}
                  disabled={addSongMutation.isPending}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={addSongMutation.isPending || !newSongTitle.trim()}
              className="w-full md:w-auto"
            >
              {addSongMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Song...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Song
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Songs List */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Tracklist ({sortedSongs.length} songs)
          </CardTitle>
          <CardDescription>
            Manage the songs in this release
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSongs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No songs added yet.</p>
              <p className="text-sm">Add your first song using the form above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSongs.map((song) => (
                <div key={song.id}>
                  {editingSong?.id === song.id ? (
                    // Edit Form
                    <form onSubmit={handleUpdateSong} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="edit-title">Song Title</Label>
                          <Input
                            id="edit-title"
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            disabled={updateSongMutation.isPending}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-duration">Duration (seconds)</Label>
                          <Input
                            id="edit-duration"
                            type="number"
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            disabled={updateSongMutation.isPending}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          size="sm"
                          disabled={updateSongMutation.isPending || !editTitle.trim()}
                        >
                          {updateSongMutation.isPending ? (
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
                          onClick={() => setEditingSong(null)}
                          disabled={updateSongMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // Display Mode
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20 border border-border/50">
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="min-w-[3rem] justify-center">
                          {song.track_number}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{song.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Duration: {formatDuration(song.duration)}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSong(song)}
                          disabled={updateSongMutation.isPending || deleteSongMutation.isPending}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSong(song.id)}
                          disabled={updateSongMutation.isPending || deleteSongMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
