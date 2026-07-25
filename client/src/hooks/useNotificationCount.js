import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/**
 * Fetches the unread notification count on mount/login, and bumps it
 * immediately whenever a live notification arrives over the socket -
 * so the navbar badge feels instant rather than waiting for the next poll.
 */
export const useNotificationCount = () => {
  const { isAuthenticated } = useAuth();
  const { liveNotification } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    notificationService
      .getNotifications(1, 1)
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (liveNotification) setUnreadCount((c) => c + 1);
  }, [liveNotification]);

  return { unreadCount };
};
