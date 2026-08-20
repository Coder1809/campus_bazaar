import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { connectSocket, disconnectSocket } from '../lib/socket';

let authState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};
let authListeners = [];

const notifyAuth = () => {
  authListeners.forEach((l) => l({ ...authState }));
};

export const useAuthStore = (selector) => {
  const [state, setState] = useState({ ...authState });

  useEffect(() => {
    const listener = (val) => setState(val);
    authListeners.push(listener);
    return () => {
      authListeners = authListeners.filter((l) => l !== listener);
    };
  }, []);

  const store = {
    ...state,
    login: async (credentials) => {
      const response = await api.post('/users/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      connectSocket(accessToken);
      authState = { user, isAuthenticated: true, isLoading: false };
      notifyAuth();
      return response.data;
    },
    register: async (formData) => {
      const response = await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    logout: async () => {
      try {
        await api.post('/users/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      disconnectSocket();
      authState = { user: null, isAuthenticated: false, isLoading: false };
      notifyAuth();
    },
    checkAuth: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        authState = { ...authState, isLoading: false };
        notifyAuth();
        return;
      }
      try {
        const response = await api.get('/users/current-user');
        connectSocket(token);
        authState = { user: response.data.data, isAuthenticated: true, isLoading: false };
        notifyAuth();
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        authState = { user: null, isAuthenticated: false, isLoading: false };
        notifyAuth();
      }
    },
    updateUser: (userData) => {
      authState = { ...authState, user: { ...authState.user, ...userData } };
      notifyAuth();
    }
  };

  return typeof selector === 'function' ? selector(store) : store;
};

export default useAuthStore;
