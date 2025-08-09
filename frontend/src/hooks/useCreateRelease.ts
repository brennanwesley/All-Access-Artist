import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

// Zod schema for new release form validation
export const createReleaseSchema = z.object({
  title: z.string().min(1, 'Track or project title is required'),
  releaseDate: z.string().min(1, 'Release date is required'),
  productType: z.enum(['single', 'ep', 'album'], {
    required_error: 'Product type is required',
  }),
  budget: z.string().optional(),
});

export type CreateReleaseFormData = z.infer<typeof createReleaseSchema>;

// Transform form data to match backend API schema
const transformFormDataToApiPayload = (formData: CreateReleaseFormData) => ({
  title: formData.title,
  release_date: formData.releaseDate,
  release_type: formData.productType,
  status: 'draft', // Default status for new releases
  genre: null, // Will be set later by user
  duration_seconds: 0, // Will be updated when tracks are added
  track_count: formData.productType === 'single' ? 1 : 
               formData.productType === 'ep' ? 4 : 10, // Reasonable defaults
  cover_art_url: null, // Will be uploaded later
  spotify_url: null,
  apple_music_url: null,
  youtube_url: null,
  description: null,
  tags: null,
});

export const useCreateRelease = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: CreateReleaseFormData) => {
      const payload = transformFormDataToApiPayload(formData);
      const response = await apiClient.createRelease(payload);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch releases queries
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      
      toast({
        title: 'Success',
        description: 'New release created successfully!',
      });
    },
    onError: (error: any) => {
      console.error('Failed to create release:', error);
      
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create release. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
