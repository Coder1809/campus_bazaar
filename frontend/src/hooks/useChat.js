import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, connectSocket } from '../lib/socket';
import api from '../lib/axios';

export const useChat = (transactionId) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [typingUser, setTypingUser] = useState(null);
    const isTypingRef = useRef(false);

    useEffect(() => {
        if (!transactionId) {
            setMessages([]);
            setIsLoading(false);
            setTypingUser(null);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        // Clear previous conversation immediately to avoid showing stale messages
        setMessages([]);
        setTypingUser(null);

        const fetchMessages = async () => {
            try {
                const response = await api.get(`/messages/${transactionId}`);
                const data = response.data?.data;
                if (isMounted) {
                    const fetchedList = data?.messages || (Array.isArray(data) ? data : []);
                    setMessages(fetchedList);
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                if (isMounted) setMessages([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchMessages();

        const socket = getSocket() || connectSocket();
        if (socket) {
            socket.emit('join-transaction', transactionId);

            const handleNewMessage = (message) => {
                if (!isMounted || !message) return;
                
                // Ensure message belongs to this transaction
                const msgTxnId = message.transaction?._id || message.transaction;
                if (msgTxnId && String(msgTxnId) !== String(transactionId)) {
                    return;
                }

                setMessages((prev) => {
                    // Strict ID deduplication
                    const exists = prev.some((m) => String(m._id) === String(message._id));
                    if (exists) return prev;
                    return [...prev, message];
                });
            };

            const handleTyping = ({ userId }) => {
                if (isMounted) setTypingUser(userId);
            };

            const handleStopTyping = () => {
                if (isMounted) setTypingUser(null);
            };

            socket.on('new-message', handleNewMessage);
            socket.on('user-typing', handleTyping);
            socket.on('user-stop-typing', handleStopTyping);

            return () => {
                isMounted = false;
                socket.emit('leave-transaction', transactionId);
                socket.off('new-message', handleNewMessage);
                socket.off('user-typing', handleTyping);
                socket.off('user-stop-typing', handleStopTyping);
            };
        }

        return () => {
            isMounted = false;
        };
    }, [transactionId]);

    // Send message via REST API (with client-side state update and deduplication)
    const sendMessage = useCallback(async (content) => {
        if (!transactionId || !content?.trim()) return;
        
        try {
            const response = await api.post(`/messages/${transactionId}`, { content: content.trim() });
            const newMessage = response.data?.data;
            if (newMessage) {
                setMessages((prev) => {
                    const exists = prev.some((m) => String(m._id) === String(newMessage._id));
                    if (exists) return prev;
                    return [...prev, newMessage];
                });
            }
            return newMessage;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }, [transactionId]);

    const startTyping = useCallback(() => {
        const socket = getSocket();
        if (socket && transactionId && !isTypingRef.current) {
            socket.emit('typing', { transactionId });
            isTypingRef.current = true;
        }
    }, [transactionId]);

    const stopTyping = useCallback(() => {
        const socket = getSocket();
        if (socket && transactionId && isTypingRef.current) {
            socket.emit('stop-typing', { transactionId });
            isTypingRef.current = false;
        }
    }, [transactionId]);

    return {
        messages,
        isLoading,
        typingUser,
        sendMessage,
        startTyping,
        stopTyping
    };
};

