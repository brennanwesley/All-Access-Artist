import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ComingSoonOverlayProps {
  feature: string;
}

export const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({ feature }) => {
  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex items-start justify-center bg-background/80 px-4 pt-20 backdrop-blur-sm md:bottom-0 md:pt-24">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-lg sm:p-8">
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
