import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Music, Loader2, AlertCircle } from "lucide-react";
import { useCreateRelease } from '@/hooks/api/useReleases';
import { useAuth } from '@/contexts/AuthContext';
import { useEnsureArtistProfile } from '@/hooks/api/useArtistProfile';
import { toast } from 'sonner';

// Schema for form validation
const createReleaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist_id: z.string().min(1, 'Artist ID is required'),
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
  const { profile, hasProfile, ensureProfile, isCreating } = useEnsureArtistProfile();
  
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
      artist_id: user?.id || '', // Get from authenticated user
      release_date: '',
      release_type: 'single',
      status: 'draft',
      description: '',
      genre: '',
    },
  });

  const onSubmit = async (data: CreateReleaseFormData) => {
    // Ensure user is authenticated
    if (!user?.id) {
      toast.error('You must be logged in to create a release.');
      return;
    }

    try {
      // Ensure user has an artist profile before creating release
      let artistProfile = profile;
      if (!hasProfile) {
        toast.info('Creating your artist profile...');
        artistProfile = await ensureProfile();
      }

      if (!artistProfile) {
        toast.error('Failed to create artist profile. Please try again.');
        return;
      }

      // Transform form data to match backend API schema
      const releaseData = {
        title: data.title,
        artist_id: artistProfile.id, // Use artist profile ID, not user ID
        release_date: new Date(data.release_date).toISOString(), // Convert to ISO datetime string
        release_type: data.release_type, // Backend expects 'release_type' to match database schema
        status: data.status,
        ...(data.description && { description: data.description }),
        ...(data.genre && { genre: data.genre }),
      };
      
      await createReleaseMutation.mutateAsync(releaseData);
      
      // Show success message
      toast.success('Release created successfully!');
      
      // Reset form and close modal on success
      reset();
      onOpenChange(false);
    } catch (error) {
      // Enhanced error handling with proper message extraction
      console.error('Form submission error:', error);
      
      let errorMessage = 'Failed to create release. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = errorObj.error;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Music className="h-5 w-5 text-primary" />
            Create New Release
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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



            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1"
                disabled={isSubmitting || createReleaseMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="hero" 
                className="flex-1"
                disabled={!user || isSubmitting || createReleaseMutation.isPending || isCreating}
              >
                {(isSubmitting || createReleaseMutation.isPending || isCreating) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreating ? 'Setting up profile...' : 'Creating...'}
                  </>
                ) : (
                  'Create Release'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
