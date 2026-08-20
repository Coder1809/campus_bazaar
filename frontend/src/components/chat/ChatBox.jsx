import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Avatar, Loader } from '../ui';
import { useChat } from '../../hooks/useChat';
import useAuthStore from '../../stores/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ChatBox({ transactionId }) {
    const { messages, isLoading, typingUser, sendMessage, startTyping, stopTyping } = useChat(transactionId);
    const { user } = useAuthStore();
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isInitialLoadRef = useRef(true);

    // Track initial load per transaction
    useEffect(() => {
        isInitialLoadRef.current = true;
    }, [transactionId]);

    // Scroll to bottom appropriately
    useEffect(() => {
        if (messages.length === 0) return;

        if (isInitialLoadRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            isInitialLoadRef.current = false;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        startTyping();

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(stopTyping, 1200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        setSending(true);
        try {
            await sendMessage(trimmed);
            setInput('');
            stopTyping();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatMessageTime = (message) => {
        try {
            const dateVal = message.timestamp || message.createdAt || Date.now();
            const d = new Date(dateVal);
            return isNaN(d.getTime()) ? '' : format(d, 'h:mm a');
        } catch {
            return '';
        }
    };

    const currentUserId = String(user?._id || user?.id || '');

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                <Loader size="md" />
                <span className="text-xs font-semibold text-gray-500">Loading conversation...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[420px] bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            {/* Messages Area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gray-50/40"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                            <Send size={20} className="ml-0.5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">No messages yet</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                            Start the conversation to discuss meetup location, item condition, or pickup schedule.
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const senderId = String(message.sender?._id || message.sender || '');
                        const isMe = Boolean(currentUserId && senderId === currentUserId);
                        const senderName = message.sender?.fullName || message.sender?.username || (isMe ? 'You' : 'User');
                        const senderAvatar = message.sender?.avatar;

                        return (
                            <div
                                key={message._id || `msg-${index}`}
                                className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <Avatar 
                                    src={senderAvatar} 
                                    name={senderName} 
                                    size="sm" 
                                    className="shrink-0 mb-1"
                                />
                                <div className={`max-w-[80%] sm:max-w-[70%] ${isMe ? 'items-end text-right' : 'items-start text-left'} flex flex-col`}>
                                    <div className={`
                                        px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap shadow-xs
                                        ${isMe 
                                            ? 'bg-blue-600 text-white rounded-br-sm' 
                                            : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-sm'
                                        }
                                    `}>
                                        {message.content}
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400 mt-1 px-1">
                                        {formatMessageTime(message)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {typingUser && String(typingUser) !== currentUserId && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200/60 py-1.5 px-3 rounded-full w-fit animate-in fade-in duration-200">
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>typing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending}
                        className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                        aria-label="Send message"
                    >
                        {sending ? <Loader size="sm" className="text-white" /> : <Send size={17} className="ml-0.5" />}
                    </button>
                </div>
            </form>
        </div>
    );
}

