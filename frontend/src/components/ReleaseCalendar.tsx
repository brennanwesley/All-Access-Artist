import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Clock, Music, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { NewReleaseModal } from "./NewReleaseModal";
import { useReleases } from "@/hooks/api/useReleases";

// Import the Release type
interface Release {
  id: string;
  title: string;
  user_id: string;
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
  
  const handleNewReleaseClick = () => {
    setIsModalOpen(true);
  };
  
  // Fetch releases from API
  const { data: releases, isLoading, isError, error } = useReleases();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
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

  const getReleaseStatusLabel = (status: Release['status']) => {
    switch (status) {
      case 'released':
        return 'Released';
      case 'scheduled':
        return 'Scheduled';
      case 'draft':
      default:
        return 'Draft';
    }
  };

  const getReleaseStatusClassName = (status: Release['status']) => {
    switch (status) {
      case 'released':
        return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300';
      case 'scheduled':
        return 'border-blue-500/40 bg-blue-500/15 text-blue-300';
      case 'draft':
      default:
        return 'border-amber-500/40 bg-amber-500/15 text-amber-300';
    }
  };

  const getCountdownLabel = (dateString: string) => {
    const diffDays = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    }

    if (diffDays === 0) {
      return 'Releases today';
    }

    return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
  };

  const renderHeader = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Release Manager</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Plan, track, and manage your music releases
        </p>
      </div>
      <Button variant="hero" size="lg" onClick={handleNewReleaseClick} className="w-full sm:w-auto">
        <Plus className="mr-2 h-5 w-5" />
        New Release
      </Button>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {renderHeader()}
        
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Release Modal */}
        <NewReleaseModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {renderHeader()}
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load releases: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>

        {/* New Release Modal */}
        <NewReleaseModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      </div>
    );
  }

  // Empty state
  if (!releases || releases.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {renderHeader()}
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No releases yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding a New Release...
            </p>
            <Button onClick={handleNewReleaseClick}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Release
            </Button>
          </CardContent>
        </Card>
        
        {/* New Release Modal */}
        <NewReleaseModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      </div>
    );
  }

  // Success state with data
  return (
    <div className="space-y-6 sm:space-y-8">
      {renderHeader()}

      {/* Timeline View */}
      <div className="grid gap-6">
        {releases.map((release: Release) => (
          <Link key={release.id} to={`/releases/${release.id}`} className="block">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex items-start gap-2 text-lg sm:text-xl leading-tight break-words">
                    <Music className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <span>{release.title}</span>
                  </CardTitle>
                  <Badge variant="outline" className={getReleaseStatusClassName(release.status)}>
                    {getReleaseStatusLabel(release.status)}
                  </Badge>
                </div>
                <CardDescription className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(release.release_date)}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>{getReleaseTypeLabel(release.release_type)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {release.description && (
                  <p className="text-sm text-muted-foreground mb-3 break-words">{release.description}</p>
                )}

                <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{getCountdownLabel(release.release_date)}</span>
                  </div>
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Manage
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
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
