import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LogOut, Settings } from 'lucide-react'
import { ProfileModal } from '../ProfileModal'

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth()
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const artistName = user.user_metadata?.['artist_name'] || user.user_metadata?.['full_name'] || 'Artist'

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.user_metadata?.['avatar_url']} />
            <AvatarFallback>
              {getInitials(user.email || '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {artistName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        
        <div className="pt-2 space-y-2">
          <Button 
            onClick={() => setProfileModalOpen(true)}
            variant="ghost" 
            size="sm"
            className="w-full"
          >
            <Settings className="mr-2 h-4 w-4" />
            Profile Settings
          </Button>
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <ProfileModal 
          open={profileModalOpen} 
          onOpenChange={setProfileModalOpen} 
        />
      </CardContent>
    </Card>
  )
}
