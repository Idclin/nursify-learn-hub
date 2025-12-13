import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/LevelBadge';
import { User, Mail, LogOut, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({ open, onOpenChange }) => {
  const { profile, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    onOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            My Profile
          </SheetTitle>
          <SheetDescription>
            View and manage your profile information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          {/* Profile Card */}
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile?.full_name ? getInitials(profile.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{profile?.full_name || 'Student'}</h2>
            {profile?.level && (
              <div className="mt-2">
                <LevelBadge level={profile.level} />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <GraduationCap className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Program Level</p>
                <p className="font-medium">Level {profile?.level || '100'}</p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-8">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
