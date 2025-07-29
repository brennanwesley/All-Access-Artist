import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Users, 
  Music, 
  MapPin, 
  Star,
  MessageCircle,
  Play
} from "lucide-react";

export const Community = () => {
  const [openToCollaborations, setOpenToCollaborations] = useState(false);

  const nearbyUsers = [
    {
      id: 1,
      name: "Sarah Chen",
      genre: "Indie Pop",
      distance: "3.2 miles",
      followers: "12.5K",
      rating: 4.8,
      skills: ["Vocals", "Guitar", "Songwriting"],
      avatar: "SC",
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Marcus Williams",
      genre: "Hip-Hop",
      distance: "7.8 miles",
      followers: "8.9K",
      rating: 4.6,
      skills: ["Production", "Mixing", "Rap"],
      avatar: "MW",
      lastActive: "1 day ago"
    },
    {
      id: 3,
      name: "Luna Rodriguez",
      genre: "Electronic",
      distance: "12.1 miles",
      followers: "15.3K",
      rating: 4.9,
      skills: ["Synths", "Production", "DJ"],
      avatar: "LR",
      lastActive: "3 hours ago"
    },
    {
      id: 4,
      name: "Alex Thompson",
      genre: "Rock",
      distance: "18.7 miles",
      followers: "6.2K",
      rating: 4.4,
      skills: ["Drums", "Bass", "Live Performance"],
      avatar: "AT",
      lastActive: "5 hours ago"
    },
    {
      id: 5,
      name: "Maya Patel",
      genre: "R&B",
      distance: "22.3 miles",
      followers: "9.7K",
      rating: 4.7,
      skills: ["Vocals", "Piano", "Arrangement"],
      avatar: "MP",
      lastActive: "1 hour ago"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Community</h2>
              <p className="text-lg opacity-90">
                Connect and collaborate with other artists
              </p>
            </div>
            <Users className="h-12 w-12 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Collaboration Settings
          </CardTitle>
          <CardDescription>
            Let other artists know you're open to working together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">Open to Collaborations?</span>
                <span className="text-sm text-muted-foreground">
                  Show your profile to nearby artists
                </span>
              </div>
            </div>
            <Switch 
              checked={openToCollaborations}
              onCheckedChange={setOpenToCollaborations}
            />
          </div>
        </CardContent>
      </Card>

      {/* Nearby Artists */}
      {openToCollaborations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Artists Near You
            </CardTitle>
            <CardDescription>
              Connect with musicians within 25 miles of your location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nearbyUsers.map((user) => (
              <div key={user.id} className="p-4 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.genre}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{user.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {user.followers} followers
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {user.lastActive}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {user.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" className="flex-1">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!openToCollaborations && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Enable Collaborations</h3>
            <p className="text-muted-foreground mb-4">
              Turn on the collaboration toggle above to discover and connect with other artists in your area.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};