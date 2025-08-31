import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ComingSoonOverlayProps {
  feature: string;
}

export const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({ feature }) => {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
      <div className="text-center p-8 bg-card rounded-lg border shadow-lg max-w-md">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{feature}</h2>
          <p className="text-muted-foreground mb-4">
            This feature is coming soon! We're working hard to bring you powerful tools to grow your music career.
          </p>
          <Badge variant="outline" className="text-xs">
            MVP Feature
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Stay tuned for updates
        </div>
      </div>
    </div>
  );
};
