import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Loader2, Music, Plus, Sparkles } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { useAddSong, useCreateLyricSheet, type Song } from '@/hooks/api/useReleaseDetails'

interface TracksWorkspaceProps {
  releaseId: string
  releaseTitle: string
  songs: Song[]
  onPrepareOfficialDocs: () => void
}

const formatDuration = (seconds?: number) => {
  if (!seconds) {
    return 'Not set'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const TracksWorkspace = ({
  releaseId,
  releaseTitle,
  songs,
  onPrepareOfficialDocs,
}: TracksWorkspaceProps) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [songTitle, setSongTitle] = useState('')
  const [draftNotes, setDraftNotes] = useState('')
  const [duration, setDuration] = useState('')

  const addSongMutation = useAddSong()
  const createLyricSheetMutation = useCreateLyricSheet()

  const sortedSongs = useMemo(
    () => [...songs].sort((left, right) => left.track_number - right.track_number),
    [songs]
  )

  const nextTrackNumber = useMemo(() => {
    return Math.max(0, ...songs.map((song) => song.track_number)) + 1
  }, [songs])

  const resetComposer = () => {
    setSongTitle('')
    setDraftNotes('')
    setDuration('')
  }

  const handleCreateTrack = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!songTitle.trim()) {
      toast.error('Please enter a track title.')
      return
    }

    try {
      const durationSeconds = duration.trim() ? Number.parseInt(duration, 10) : undefined
      if (durationSeconds !== undefined && Number.isNaN(durationSeconds)) {
        toast.error('Duration must be a number if you choose to set it.')
        return
      }

      const createdSong = await addSongMutation.mutateAsync({
        releaseId,
        songData: {
          song_title: songTitle.trim(),
          track_number: nextTrackNumber,
          ...(durationSeconds !== undefined ? { duration_seconds: durationSeconds } : {}),
        },
      })

      const trimmedNotes = draftNotes.trim()
      if (trimmedNotes) {
        try {
          await createLyricSheetMutation.mutateAsync({
            songId: createdSong.id,
            writtenBy: '',
            notes: trimmedNotes,
          })
        } catch {
          toast.error('Track created, but the draft notes could not be saved right now.')
        }
      }

      toast.success('Track draft started successfully.')
      resetComposer()
      setIsComposerOpen(false)
    } catch {
      toast.error('Unable to create this track right now. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Tracks
            </CardTitle>
            <CardDescription>
              Start a track draft fast, then use official docs later when you are ready to build the full label copy and split sheet for {releaseTitle}.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" onClick={onPrepareOfficialDocs} className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Prepare Official Docs
            </Button>
            <Button onClick={() => setIsComposerOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Start Track
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {sortedSongs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-secondary/10 p-6 text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h3 className="text-base font-semibold">Create your first track draft</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Add just a title and a few notes to get moving. You can keep the formal label copy and split sheet work for later.
              </p>
              <Button className="mt-5" onClick={() => setIsComposerOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Start Track
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="min-w-[3rem] justify-center">
                        {song.track_number}
                      </Badge>
                      <h3 className="truncate font-medium">{song.song_title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duration: {formatDuration(song.duration_seconds)}
                    </p>
                  </div>
                  <Badge variant="outline" className="self-start text-muted-foreground">
                    Draft ready
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start Track</DialogTitle>
            <DialogDescription>
              Capture the first draft details now. You can turn this into official label copy and split sheet data later.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTrack} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="track-title">Track Title *</Label>
              <Input
                id="track-title"
                value={songTitle}
                onChange={(event) => setSongTitle(event.target.value)}
                placeholder="Enter your track title"
                autoComplete="off"
                disabled={addSongMutation.isPending || createLyricSheetMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="track-notes">Draft Notes / Rough Lyrics</Label>
              <Textarea
                id="track-notes"
                value={draftNotes}
                onChange={(event) => setDraftNotes(event.target.value)}
                placeholder="Write a rough verse, a concept note, collaborator ideas, or anything you want to remember later."
                rows={6}
                disabled={addSongMutation.isPending || createLyricSheetMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="track-duration">Duration (optional)</Label>
              <Input
                id="track-duration"
                type="number"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="180"
                min={1}
                disabled={addSongMutation.isPending || createLyricSheetMutation.isPending}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsComposerOpen(false)
                  resetComposer()
                }}
                disabled={addSongMutation.isPending || createLyricSheetMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addSongMutation.isPending || createLyricSheetMutation.isPending}
              >
                {addSongMutation.isPending || createLyricSheetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Draft...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
