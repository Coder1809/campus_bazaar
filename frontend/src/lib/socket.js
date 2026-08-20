import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

let socket = null;

export const connectSocket = (token) => {
    const authToken = token || localStorage.getItem('accessToken');
    if (!authToken) return null;

    if (socket) {
        if (socket.connected) {
            return socket;
        }
        socket.auth = { token: authToken };
        socket.connect();
        return socket;
    }
    
    socket = io(SOCKET_URL, {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
        // Connected successfully
    });
    
    socket.on('connect_error', (error) => {
        console.warn('Socket connection warning:', error.message);
    });
    
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => {
    if (!socket || !socket.connected) {
        return connectSocket();
    }
    return socket;
};

