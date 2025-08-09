import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Music, Loader2 } from "lucide-react";
import { useCreateRelease, createReleaseSchema, type CreateReleaseFormData } from '@/hooks/useCreateRelease';

interface NewReleaseFormProps {
  onBack: () => void;
  onCreateRelease?: (releaseData: any) => void; // Optional for backward compatibility
}

export const NewReleaseForm = ({ onBack, onCreateRelease }: NewReleaseFormProps) => {
  const createReleaseMutation = useCreateRelease();
  
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
      releaseDate: '',
      budget: '',
    },
  });

  const onSubmit = async (data: CreateReleaseFormData) => {
    try {
      const result = await createReleaseMutation.mutateAsync(data);
      
      // Call the optional callback for backward compatibility
      if (onCreateRelease) {
        onCreateRelease(result);
      }
      
      // Reset form and go back on success
      reset();
      onBack();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Release Manager
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Create New Release</h2>
          <p className="text-muted-foreground mt-2">
            Add a new track, EP, or album to your release schedule
          </p>
        </div>
      </div>

      <Card className="max-w-2xl bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Music className="h-5 w-5 text-primary" />
            Release Details
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="releaseDate">Target Release Date *</Label>
              <div className="relative">
                <Input
                  id="releaseDate"
                  type="date"
                  {...register('releaseDate')}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.releaseDate && (
                <p className="text-sm text-destructive">{errors.releaseDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">Type of Product *</Label>
              <Controller
                name="productType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="ep">EP</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.productType && (
                <p className="text-sm text-destructive">{errors.productType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Project Budget</Label>
              <Input
                id="budget"
                type="text"
                placeholder="Enter project budget (e.g., $5,000)"
                {...register('budget')}
              />
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack} 
                className="flex-1"
                disabled={isSubmitting || createReleaseMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="hero" 
                className="flex-1"
                disabled={isSubmitting || createReleaseMutation.isPending}
              >
                {(isSubmitting || createReleaseMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Release'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};