import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Calendar, CalendarDays, Loader2 } from "lucide-react"
import { ReleaseDetails } from "@/hooks/api/useReleaseDetails"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

interface EditReleaseModalProps {
  isOpen: boolean
  onClose: () => void
  release: ReleaseDetails
  onUpdate: (updatedData: {
    title: string
    release_date: string
    release_type: 'single' | 'ep' | 'album' | 'mixtape'
    genre?: string
    description?: string
  }) => Promise<void>
}

type EditReleaseFormData = {
  title: string
  release_date: string
  release_type: 'single' | 'ep' | 'album' | 'mixtape'
  genre: string
  description: string
}

const createInitialFormData = (release: ReleaseDetails): EditReleaseFormData => ({
  title: release.title,
  release_date: release.release_date?.split('T')[0] ?? '',
  release_type: release.release_type,
  genre: release.genre || '',
  description: release.description || ''
})

export const EditReleaseModal = ({ isOpen, onClose, release, onUpdate }: EditReleaseModalProps) => {
  const [formData, setFormData] = useState(() => createInitialFormData(release))
  const isMobile = useIsMobile()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showReleaseTypeWarning, setShowReleaseTypeWarning] = useState(false)
  const [hasReleaseTypeChanged, setHasReleaseTypeChanged] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData(createInitialFormData(release))
    setHasReleaseTypeChanged(false)
    setShowConfirmation(false)
    setShowReleaseTypeWarning(false)
  }, [isOpen, release])

  const closeModal = () => {
    setShowConfirmation(false)
    setShowReleaseTypeWarning(false)
    onClose()
  }

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      closeModal()
    }
  }

  const handleInputChange = <K extends keyof EditReleaseFormData>(field: K, value: EditReleaseFormData[K]) => {
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
        release_date: formData.release_date
      } satisfies Parameters<EditReleaseModalProps['onUpdate']>[0]
      
      await onUpdate(updateData)
      
      // Show success toast with different message based on what changed
      const originalDate = release.release_date?.split('T')[0] ?? ''
      const dateChanged = formData.release_date !== originalDate
      if (dateChanged) {
        toast.success('Release updated successfully! Project timeline dates have been recalculated.')
      } else {
        toast.success('Release updated successfully!')
      }
      
      closeModal()
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

  const renderFormContent = (mobile: boolean) => (
    <>
      <div className={mobile ? "flex-1 space-y-4 overflow-y-auto px-4 pb-4" : "space-y-4 py-4"}>
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
          {release.release_date && (
            <p className="text-xs text-muted-foreground">
              Current: {formatDateForDisplay(release.release_date)}
            </p>
          )}
        </div>

        {/* Type of Release */}
        <div className="space-y-2">
          <Label htmlFor="release_type">Type of Release</Label>
          <Select
            value={formData.release_type}
            onValueChange={(value) => handleInputChange('release_type', value as EditReleaseFormData['release_type'])}
          >
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

      <div
        className={mobile
          ? "border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80"
          : ""
        }
      >
        <div className={mobile ? "grid grid-cols-2 gap-3" : "flex justify-end gap-3"}>
          <Button variant="outline" onClick={closeModal} disabled={isLoading}>
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
        </div>
      </div>
    </>
  )

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={handleModalOpenChange}>
          <DrawerContent className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] rounded-t-2xl p-0 flex flex-col">
            <DrawerHeader className="px-4 pb-2 text-left">
              <DrawerTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Edit Release
              </DrawerTitle>
              <DrawerDescription>
                Update your release details. Changes to the release date will affect your project timeline.
              </DrawerDescription>
            </DrawerHeader>

            {renderFormContent(true)}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
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

            {renderFormContent(false)}
          </DialogContent>
        </Dialog>
      )}

      {/* Release Type Change Warning */}
      {isMobile ? (
        <Drawer open={showReleaseTypeWarning} onOpenChange={setShowReleaseTypeWarning}>
          <DrawerContent className="rounded-t-2xl">
            <DrawerHeader className="text-left">
              <DrawerTitle>Release Type Changed</DrawerTitle>
              <DrawerDescription>
                Changing release type will update your project checklist. Completed tasks will remain marked, but new tasks may be added based on the new release type.
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-2 gap-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
              <Button variant="outline" onClick={() => setShowReleaseTypeWarning(false)}>
                Cancel
              </Button>
              <Button onClick={handleReleaseTypeWarningConfirm}>Continue</Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
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
      )}

      {/* Main Confirmation Dialog */}
      {isMobile ? (
        <Drawer open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DrawerContent className="rounded-t-2xl">
            <DrawerHeader className="text-left">
              <DrawerTitle>Update Release?</DrawerTitle>
              <DrawerDescription>
                This will update your release details and may affect your project timeline dates.
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-2 gap-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
              <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleConfirmUpdate} disabled={isLoading}>
                Update Release
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
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
              <AlertDialogAction onClick={handleConfirmUpdate} disabled={isLoading}>
                Update Release
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
