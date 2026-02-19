import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Music, Loader2, AlertCircle } from "lucide-react";
import { useCreateRelease } from '@/hooks/api/useReleases';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from '@/components/ui/sonner';
import { logger } from '@/lib/logger';

// Schema for form validation - simplified to use user_id directly
const createReleaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  release_date: z.string().min(1, 'Release date is required'),
  release_type: z.enum(['single', 'ep', 'album', 'mixtape']),
  status: z.enum(['draft', 'scheduled', 'released']).default('draft'),
  description: z.string().optional(),
  genre: z.string().optional(),
});

type CreateReleaseFormData = z.infer<typeof createReleaseSchema>;

interface NewReleaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewReleaseModal = ({ open, onOpenChange }: NewReleaseModalProps) => {
  const createReleaseMutation = useCreateRelease();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateReleaseFormData>({
    resolver: zodResolver(createReleaseSchema),
    defaultValues: {
      title: '',
      release_date: '',
      release_type: 'single',
      status: 'draft',
      description: '',
      genre: '',
    },
  });

  const onSubmit = async (data: CreateReleaseFormData) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a release.');
      return;
    }

    try {
      // Transform form data to include user_id
      const releaseData = {
        title: data.title,
        user_id: user.id, // Use user ID directly
        release_date: data.release_date, // Keep as YYYY-MM-DD format from date input
        release_type: data.release_type,
        status: data.status,
        ...(data.description && { description: data.description }),
        ...(data.genre && { genre: data.genre }),
      };
      
      await createReleaseMutation.mutateAsync(releaseData);
      toast.success('Release created successfully!');
      reset();
      onOpenChange(false);
    } catch (error) {
      logger.error('New release form submission failed', { error });
      
      let errorMessage = 'Failed to create release. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as { message?: string; error?: string };
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = errorObj.error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const renderFormContent = (mobile: boolean) => (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={mobile ? "flex h-full flex-col" : "space-y-6"}
    >
      <div className={mobile ? "flex-1 space-y-4 overflow-y-auto px-4 pb-4" : "space-y-6"}>
        <p className="text-muted-foreground">
          Add a new track, EP, or album to your release schedule
        </p>

        {/* Authentication Check */}
        {!user && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to create a release. Please sign in and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* API Error Display */}
        {createReleaseMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createReleaseMutation.error?.message || 'Failed to create release. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Track or Project Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter your track or project title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="release_date">Target Release Date *</Label>
            <div className="relative">
              <Input
                id="release_date"
                type="date"
                {...register('release_date')}
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.release_date && (
              <p className="text-sm text-destructive">{errors.release_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="release_type">Type of Release *</Label>
            <Controller
              name="release_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={field.onChange}>
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
              )}
            />
            {errors.release_type && (
              <p className="text-sm text-destructive">{errors.release_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre (Optional)</Label>
            <Input
              id="genre"
              type="text"
              placeholder="e.g., Pop, Rock, Hip-Hop"
              {...register('genre')}
            />
            {errors.genre && (
              <p className="text-sm text-destructive">{errors.genre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="Brief description of the release"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      <div
        className={mobile
          ? "border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80"
          : "flex justify-end gap-3 pt-4"
        }
      >
        <div className={mobile ? "grid grid-cols-2 gap-3" : "flex justify-end gap-3"}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={mobile ? "w-full" : undefined}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createReleaseMutation.isPending}
            className={mobile ? "w-full" : "min-w-[120px]"}
          >
            {isSubmitting || createReleaseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Release'
            )}
          </Button>
        </div>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] rounded-t-2xl p-0">
          <DrawerHeader className="px-4 pb-2 text-left">
            <DrawerTitle className="flex items-center gap-3">
              <Music className="h-5 w-5 text-primary" />
              Create New Release
            </DrawerTitle>
          </DrawerHeader>

          {renderFormContent(true)}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Music className="h-5 w-5 text-primary" />
            Create New Release
          </DialogTitle>
        </DialogHeader>

        {renderFormContent(false)}
      </DialogContent>
    </Dialog>
  );
};
