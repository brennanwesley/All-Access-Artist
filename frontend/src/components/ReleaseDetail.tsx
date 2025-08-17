import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { MetadataPrep } from "./MetadataPrep";
import { ReleaseChecklist } from "./ReleaseChecklist";
// import { EditReleaseModal } from "./EditReleaseModal";
import { useGetReleaseDetails } from "@/hooks/api/useReleaseDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ReleaseDetailProps {
  onBack: () => void;
}

export const ReleaseDetail = ({ onBack }: ReleaseDetailProps) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { releaseId } = useParams<{ releaseId: string }>();
  // const updateReleaseMutation = useUpdateRelease();
  
  const {
    data: release,
    isLoading,
    isError,
    error
  } = useGetReleaseDetails(releaseId || '');

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Error Loading Release</h1>
            <p className="text-muted-foreground">Release Management Dashboard</p>
          </div>
        </div>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load release details</h3>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'An unexpected error occurred while loading the release.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Debug: Log the release data to understand its structure
  console.log('ReleaseDetail: Release data received:', release)
  console.log('ReleaseDetail: Release data expanded:', JSON.stringify(release, null, 2))
  console.log('ReleaseDetail: Release title:', release?.title)
  console.log('ReleaseDetail: Release tasks:', release?.release_tasks)
  console.log('ReleaseDetail: Release type:', release?.release_type)
  console.log('ReleaseDetail: Release date:', release?.release_date)

  // No data state
  if (!release) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Release Not Found</h1>
            <p className="text-muted-foreground">Release Management Dashboard</p>
          </div>
        </div>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Release not found</h3>
            <p className="text-muted-foreground mb-4">
              The requested release could not be found.
            </p>
            <Button onClick={onBack}>
              Back to Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }



  if (showMetadata) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowMetadata(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Release Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Metadata Management</h1>
            <p className="text-muted-foreground">{release.title}</p>
          </div>
        </div>
        <MetadataPrep />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">{release.title}</h1>
              <p className="text-muted-foreground">Release Management Dashboard</p>
            </div>
            {/* <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="ml-2"
            >
              Edit Release
            </Button> */}
          </div>
        </div>
      </div>

      {/* Release Info Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {release.release_type?.toUpperCase() || 'TBD'}
              </div>
              <p className="text-sm text-muted-foreground">Release Type</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {release.release_date ? new Date(release.release_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) : 'TBD'}
              </div>
              <p className="text-sm text-muted-foreground">Release Date</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {release.release_date ? Math.ceil((new Date(release.release_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 'TBD'}
              </div>
              <p className="text-sm text-muted-foreground">Days to Release</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {release.songs?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Tracks</p>
            </div>
          </div>
          {release.description && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-muted-foreground">{release.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="lyrics">Lyric Sheets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checklist" className="space-y-6">
          <ReleaseChecklist tasks={release.release_tasks || []} releaseDate={release.release_date} />
        </TabsContent>
        
        <TabsContent value="songs" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Songs</CardTitle>
              <CardDescription>Manage tracks for this release</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Songs management will be implemented in the next phase.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lyrics" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Lyric Sheets</CardTitle>
              <CardDescription>Create and manage lyric sheets for your tracks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Lyric sheets management will be implemented in the next phase.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>DSP Pitch Tool</CardTitle>
            <CardDescription>Submit your track to DSP playlists and curators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              Start Playlist Pitch
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Pitch to Spotify, Apple Music, and other DSP playlists
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Manage track metadata and generate label copy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowMetadata(true)}
            >
              Edit Metadata
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Update track information, lyrics, and manage writer splits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Release Modal - TEMPORARILY DISABLED FOR DEBUGGING */}
      {/* <EditReleaseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        release={release}
        onUpdate={async (updateData) => {
          await updateReleaseMutation.mutateAsync({
            releaseId: release.id,
            updateData
          })
        }}
      /> */}
    </div>
  );
};