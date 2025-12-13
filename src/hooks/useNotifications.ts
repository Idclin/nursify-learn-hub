import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

interface NotificationWithRead extends NotificationRow {
  isRead: boolean;
  userNotificationId?: string;
}

// Notification sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Could not play notification sound');
  }
};

export const useNotifications = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastNotificationIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: notifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifsError) throw notifsError;

      const { data: userNotifs, error: userNotifsError } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id);

      if (userNotifsError) throw userNotifsError;

      const readMap = new Map(
        userNotifs?.map(un => [un.notification_id, { read: un.read, id: un.id }])
      );

      const mergedNotifs = (notifs || []).map(n => ({
        ...n,
        isRead: readMap.get(n.id)?.read || false,
        userNotificationId: readMap.get(n.id)?.id,
      }));

      // Check for new notifications
      if (mergedNotifs.length > 0 && lastNotificationIdRef.current) {
        const newestId = mergedNotifs[0].id;
        if (newestId !== lastNotificationIdRef.current) {
          playNotificationSound();
        }
      }
      
      if (mergedNotifs.length > 0) {
        lastNotificationIdRef.current = mergedNotifs[0].id;
      }

      setNotifications(mergedNotifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setIsLoading(false);
  }, [user]);

  const markAsRead = useCallback(async (notification: NotificationWithRead) => {
    if (!user || notification.isRead) return;

    try {
      if (notification.userNotificationId) {
        await supabase
          .from('user_notifications')
          .update({ read: true })
          .eq('id', notification.userNotificationId);
      } else {
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
  }, [user]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as NotificationRow;
          
          // Check if notification is for user's level
          const userLevel = profile?.level;
          if (
            newNotification.target_level === 'all' ||
            newNotification.target_level === userLevel
          ) {
            playNotificationSound();
            
            setNotifications(prev => [{
              ...newNotification,
              isRead: false,
            }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.level]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    refetch: fetchNotifications,
  };
};
