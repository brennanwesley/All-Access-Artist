import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface SocialConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: {
    name: string;
    id: string;
  } | null;
  onConnect: (platform: string, url: string) => Promise<void>;
  currentUrl?: string;
}

export const SocialConnectionModal: React.FC<SocialConnectionModalProps> = ({
  isOpen,
  onClose,
  platform,
  onConnect,
  currentUrl = ""
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const normalizeUrl = (input: string, platformId: string): string => {
    if (!input.trim()) return "";
    
    // Remove @ symbol if present
    const cleanInput = input.replace(/^@/, "");
    
    // If it's already a full URL, return as is
    if (cleanInput.startsWith("http://") || cleanInput.startsWith("https://")) {
      return cleanInput;
    }
    
    // Convert username to full URL based on platform
    switch (platformId) {
      case "tiktok":
        return `https://tiktok.com/@${cleanInput}`;
      case "instagram":
        return `https://instagram.com/${cleanInput}`;
      case "youtube":
        return `https://youtube.com/@${cleanInput}`;
      case "twitter":
        return `https://x.com/${cleanInput}`;
      default:
        return cleanInput;
    }
  };

  const extractUsername = (url: string, platformId: string): string => {
    if (!url) return "";
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      switch (platformId) {
        case "tiktok":
          return pathname.replace(/^\/(@)?/, "@");
        case "instagram":
          return pathname.replace(/^\//, "@");
        case "youtube":
          return pathname.replace(/^\/(@)?/, "@");
        case "twitter":
          return pathname.replace(/^\//, "@");
        default:
          return pathname.replace(/^\//, "@");
      }
    } catch {
      return url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !inputValue.trim()) return;

    setIsLoading(true);
    try {
      const normalizedUrl = normalizeUrl(inputValue, platform.id);
      await onConnect(platform.id, normalizedUrl);
      
      toast({
        title: "Connected successfully!",
        description: `Your ${platform.name} account has been connected.`,
      });
      
      onClose();
      setInputValue("");
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please check your username/URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!platform) return;
    
    setIsLoading(true);
    try {
      await onConnect(platform.id, ""); // Empty string to disconnect
      
      toast({
        title: "Disconnected successfully!",
        description: `Your ${platform.name} account has been disconnected.`,
      });
      
      onClose();
      setInputValue("");
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = (platformId: string): string => {
    switch (platformId) {
      case "tiktok":
        return "@username or https://tiktok.com/@username";
      case "instagram":
        return "@username or https://instagram.com/username";
      case "youtube":
        return "@username or https://youtube.com/@username";
      case "twitter":
        return "@username or https://x.com/username";
      default:
        return "Enter your username or profile URL";
    }
  };

  if (!platform) return null;

  const isConnected = Boolean(currentUrl);
  const displayUsername = isConnected ? extractUsername(currentUrl, platform.id) : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isConnected ? `Update ${platform.name} Connection` : `Connect ${platform.name}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isConnected && (
            <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Currently connected:</p>
              <p className="font-medium">{displayUsername}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="social-input">
              {isConnected ? "Update" : "Enter"} your {platform.name} username or URL
            </Label>
            <Input
              id="social-input"
              type="text"
              placeholder={getPlaceholder(platform.id)}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            {isConnected && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                Disconnect
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? "Connecting..." : isConnected ? "Update" : "Connect"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
