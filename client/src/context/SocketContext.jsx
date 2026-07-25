import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [liveNotification, setLiveNotification] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = localStorage.getItem('connecthub_token');
    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    socket.on('notification', (payload) => {
      setLiveNotification(payload);
      const messages = {
        like: `${payload.from} liked your post`,
        comment: `${payload.from} commented on your post`,
        follow: `${payload.from} started following you`,
      };
      toast(messages[payload.type] || 'You have a new notification', { icon: '🔔' });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?._id]);

  const sendChatMessage = (toUserId, message) => {
    socketRef.current?.emit('chat:message', { toUserId, message });
  };

  const onChatMessage = (callback) => {
    socketRef.current?.on('chat:message', callback);
    return () => socketRef.current?.off('chat:message', callback);
  };

  return (
    <SocketContext.Provider value={{ liveNotification, sendChatMessage, onChatMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
