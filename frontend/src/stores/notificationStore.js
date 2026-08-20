import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { getSocket } from '../lib/socket';

let notifState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};
let notifListeners = [];

const notifyNotif = () => {
  notifListeners.forEach((l) => l({ ...notifState }));
};

export const useNotificationStore = (selector) => {
  const [state, setState] = useState({ ...notifState });

  useEffect(() => {
    const listener = (val) => setState(val);
    notifListeners.push(listener);
    return () => {
      notifListeners = notifListeners.filter((l) => l !== listener);
    };
  }, []);

  const store = {
    ...state,
    fetchNotifications: async () => {
      notifState = { ...notifState, isLoading: true };
      notifyNotif();
      try {
        const response = await api.get('/notifications');
        const data = response.data.data;
        notifState = { ...notifState, notifications: data.notifications || data, isLoading: false };
      } catch (error) {
        notifState = { ...notifState, isLoading: false };
        notifyNotif();
        throw error;
      }
      notifyNotif();
    },
    fetchUnreadCount: async () => {
      try {
        const response = await api.get('/notifications/unread-count');
        notifState = { ...notifState, unreadCount: response.data.data.count };
        notifyNotif();
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    },
    markAsRead: async (id) => {
      await api.patch(`/notifications/${id}/read`);
      notifState = {
        ...notifState,
        notifications: notifState.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, notifState.unreadCount - 1)
      };
      notifyNotif();
    },
    markAllAsRead: async () => {
      await api.patch('/notifications/read-all');
      notifState = {
        ...notifState,
        notifications: notifState.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      };
      notifyNotif();
    },
    addNotification: (notification) => {
      notifState = {
        ...notifState,
        notifications: [notification, ...notifState.notifications],
        unreadCount: notifState.unreadCount + 1
      };
      notifyNotif();
    },
    setupSocketListeners: () => {
      const socket = getSocket();
      if (socket) {
        socket.on('notification', (notification) => {
          store.addNotification(notification);
        });
      }
    }
  };

  return typeof selector === 'function' ? selector(store) : store;
};

export default useNotificationStore;
