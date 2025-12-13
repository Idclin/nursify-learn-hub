import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

interface NotificationWithRead extends NotificationRow {
  isRead: boolean;
  userNotificationId?: string;
}

interface NotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({ open, onOpenChange }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch notifications for user's level
      const { data: notifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifsError) throw notifsError;

      // Fetch user's read status
      const { data: userNotifs, error: userNotifsError } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id);

      if (userNotifsError) throw userNotifsError;

      const readMap = new Map(userNotifs?.map(un => [un.notification_id, { read: un.read, id: un.id }]));

      const mergedNotifs = (notifs || []).map(n => ({
        ...n,
        isRead: readMap.get(n.id)?.read || false,
        userNotificationId: readMap.get(n.id)?.id,
      }));

      setNotifications(mergedNotifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open && user) {
      fetchNotifications();
    }
  }, [open, user]);

  const markAsRead = async (notification: NotificationWithRead) => {
    if (!user || notification.isRead) return;

    try {
      if (notification.userNotificationId) {
        // Update existing record
        await supabase
          .from('user_notifications')
          .update({ read: true })
          .eq('id', notification.userNotificationId);
      } else {
        // Create new record
        await supabase
          .from('user_notifications')
          .insert({
            user_id: user.id,
            notification_id: notification.id,
            read: true,
          });
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {unreadCount} new
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with the latest content and announcements
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 rounded-lg border transition-colors',
                  notification.isRead
                    ? 'bg-background'
                    : 'bg-primary/5 border-primary/20'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium line-clamp-1',
                      !notification.isRead && 'text-primary'
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => markAsRead(notification)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
