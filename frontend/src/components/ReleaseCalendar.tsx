import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Clock, Music, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { NewReleaseModal } from "./NewReleaseModal";
import { useReleases } from "@/hooks/api/useReleases";

// Import the Release type
interface Release {
  id: string;
  title: string;
  artist_id: string;
  release_date: string;
  release_type: 'single' | 'ep' | 'album' | 'mixtape';
  status: 'draft' | 'scheduled' | 'released';
  description?: string;
  genre?: string;
  cover_art_url?: string;
  streaming_links?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const ReleaseCalendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch releases from API
  const { data: releases, isLoading, isError, error } = useReleases();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "released": return "default";
      case "scheduled": return "secondary";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "released": return "Released";
      case "scheduled": return "Scheduled";
      case "draft": return "Draft";
      default: return "Unknown";
    }
  };

  const getReleaseTypeLabel = (release_type: string) => {
    switch (release_type) {
      case "single": return "Single";
      case "album": return "Album";
      case "ep": return "EP";
      case "mixtape": return "Mixtape";
      default: return release_type;
    }
  };

  // Navigation is handled by Link components in the JSX below



  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Release Manager</h2>
            <p className="text-muted-foreground mt-2">
              Plan, track, and manage your music releases
            </p>
          </div>
          <Button variant="hero" size="lg" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            New Release
          </Button>
        </div>
        
        {/* Loading skeletons */}
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Release Manager</h2>
            <p className="text-muted-foreground mt-2">
              Plan, track, and manage your music releases
            </p>
          </div>
          <Button variant="hero" size="lg" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            New Release
          </Button>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load releases. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!releases || releases.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Release Manager</h2>
            <p className="text-muted-foreground mt-2">
              Plan, track, and manage your music releases
            </p>
          </div>
          <Button variant="hero" size="lg" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            New Release
          </Button>
        </div>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No releases yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding a New Release...
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Release
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state with data
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Release Manager</h2>
          <p className="text-muted-foreground mt-2">
            Plan, track, and manage your music releases
          </p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          New Release
        </Button>
      </div>

      {/* Timeline View */}
      <div className="grid gap-6">
        {releases.map((release: Release) => (
          <Link key={release.id} to={`/releases/${release.id}`}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Music className="h-5 w-5 text-primary" />
                      {release.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4" />
                      Release Date: {formatDate(release.release_date)}
                      <span className="text-muted-foreground">•</span>
                      {getReleaseTypeLabel(release.release_type)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(release.status)}>
                    {getStatusLabel(release.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {release.description && (
                    <p className="text-sm text-muted-foreground">{release.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {Math.ceil((new Date(release.release_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        Edit Details
                      </Button>
                      <Button variant="default" size="sm" onClick={(e) => e.stopPropagation()}>
                        Manage Tasks
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{releases.length}</div>
            <p className="text-sm text-muted-foreground">Total Releases</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {releases.filter((r: Release) => r.status === 'released').length}
            </div>
            <p className="text-sm text-muted-foreground">Released</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {releases.filter((r: Release) => r.status === 'scheduled').length}
            </div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* New Release Modal */}
      <NewReleaseModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};