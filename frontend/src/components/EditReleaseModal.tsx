import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Calendar, CalendarDays, Loader2 } from "lucide-react"
import { ReleaseDetail } from "@/hooks/api/useReleaseDetail"
import { toast } from "sonner"

interface EditReleaseModalProps {
  isOpen: boolean
  onClose: () => void
  release: ReleaseDetail
  onUpdate: (updatedData: {
    title: string
    release_date: string
    release_type: string
    genre?: string
    description?: string
  }) => Promise<void>
}

export const EditReleaseModal = ({ isOpen, onClose, release, onUpdate }: EditReleaseModalProps) => {
  const [formData, setFormData] = useState({
    title: release.title,
    release_date: release.release_date.split('T')[0], // Convert to YYYY-MM-DD format
    release_type: release.release_type,
    genre: release.genre || '',
    description: release.description || ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showReleaseTypeWarning, setShowReleaseTypeWarning] = useState(false)
  const [hasReleaseTypeChanged, setHasReleaseTypeChanged] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Check if release type changed
    if (field === 'release_type' && value !== release.release_type) {
      setHasReleaseTypeChanged(true)
    } else if (field === 'release_type' && value === release.release_type) {
      setHasReleaseTypeChanged(false)
    }
  }

  const handleSubmit = () => {
    // If release type changed, show warning first
    if (hasReleaseTypeChanged) {
      setShowReleaseTypeWarning(true)
      return
    }
    
    // Otherwise show main confirmation
    setShowConfirmation(true)
  }

  const handleReleaseTypeWarningConfirm = () => {
    setShowReleaseTypeWarning(false)
    setShowConfirmation(true)
  }

  const handleConfirmUpdate = async () => {
    setIsLoading(true)
    setShowConfirmation(false)
    
    try {
      const updateData = {
        ...formData,
        release_date: new Date(formData.release_date + 'T00:00:00.000Z').toISOString()
      }
      
      await onUpdate(updateData)
      
      // Show success toast with different message based on what changed
      const dateChanged = formData.release_date !== release.release_date.split('T')[0]
      if (dateChanged) {
        toast.success('Release updated successfully! Project timeline dates have been recalculated.')
      } else {
        toast.success('Release updated successfully!')
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to update release:', error)
      toast.error('Failed to update release. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Edit Release
            </DialogTitle>
            <DialogDescription>
              Update your release details. Changes to the release date will affect your project timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Track/Project Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Track/Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter track or project title"
              />
            </div>

            {/* Target Release Date */}
            <div className="space-y-2">
              <Label htmlFor="release_date">Target Release Date</Label>
              <div className="relative">
                <Input
                  id="release_date"
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => handleInputChange('release_date', e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {formatDateForDisplay(release.release_date)}
              </p>
            </div>

            {/* Type of Release */}
            <div className="space-y-2">
              <Label htmlFor="release_type">Type of Release</Label>
              <Select value={formData.release_type} onValueChange={(value) => handleInputChange('release_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select release type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                  <SelectItem value="mixtape">Mixtape</SelectItem>
                </SelectContent>
              </Select>
              {hasReleaseTypeChanged && (
                <p className="text-xs text-amber-600">
                  ⚠️ Changing release type will update your project checklist
                </p>
              )}
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                placeholder="Enter genre (optional)"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Release'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Type Change Warning */}
      <AlertDialog open={showReleaseTypeWarning} onOpenChange={setShowReleaseTypeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Type Changed</AlertDialogTitle>
            <AlertDialogDescription>
              Changing release type will update your project checklist. Completed tasks will remain marked, but new tasks may be added based on the new release type. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleaseTypeWarningConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Release?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update your release details and may affect your project timeline dates. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>
              Update Release
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
