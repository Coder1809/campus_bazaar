import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, Avatar, Loader, Badge } from '../components/ui';
import { MessageSquare, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import useAuthStore from '../stores/authStore';
import { getSocket, connectSocket } from '../lib/socket';

const statusLabels = {
    ACCEPTED: { label: 'Accepted', color: 'primary' },
    AGREEMENT_PROPOSED: { label: 'Agreement', color: 'warning' },
    ACTIVE: { label: 'Active', color: 'success' },
    RETURN_PENDING: { label: 'Return Pending', color: 'warning' },
    DISPUTED: { label: 'Disputed', color: 'danger' }
};

export default function Chats() {
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const fetchConversations = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const response = await api.get('/messages/conversations');
            setConversations(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations(true);

        const socket = getSocket() || connectSocket();
        if (socket) {
            const handleMessageNotification = () => {
                // Refresh conversations list silently on new message
                fetchConversations(false);
            };

            socket.on('new-message', handleMessageNotification);

            return () => {
                socket.off('new-message', handleMessageNotification);
            };
        }
    }, []);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        try {
            const d = new Date(timestamp);
            return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true });
        } catch {
            return '';
        }
    };

    const currentUserId = String(user?._id || user?.id || '');

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-2 sm:px-0">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Conversations & Deals</h1>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
                </span>
            </div>

            {conversations.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-16">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <MessageSquare size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No conversations yet</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Chats automatically open once an item request is accepted between buyer and seller.
                        </p>
                    </Card.Body>
                </Card>
            ) : (
                <div className="space-y-3">
                    {conversations.map((conv) => {
                        const status = statusLabels[conv.status] || { label: conv.status, color: 'gray' };
                        const hasUnread = conv.unreadCount > 0;
                        const lastMsgSenderId = String(conv.lastMessage?.sender?._id || conv.lastMessage?.sender || '');
                        const isLastMsgMe = Boolean(currentUserId && lastMsgSenderId === currentUserId);

                        return (
                            <Card
                                key={conv._id}
                                hover
                                onClick={() => navigate(`/transactions/${conv._id}`)}
                                className={`cursor-pointer transition-all hover:shadow-md ${hasUnread ? 'border-l-4 border-l-blue-500 bg-blue-50/20' : ''}`}
                            >
                                <Card.Body className="flex items-center gap-4 p-4 sm:p-5">
                                    {/* Other user avatar */}
                                    <div className="relative shrink-0">
                                        <Avatar
                                            src={conv.otherUser?.avatar}
                                            name={conv.otherUser?.fullName || conv.otherUser?.username || 'User'}
                                            size="lg"
                                        />
                                        {hasUnread && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[11px] rounded-full flex items-center justify-center font-bold shadow-xs">
                                                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Conversation info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className={`text-base font-bold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-800'}`}>
                                                {conv.otherUser?.fullName || 'User'}
                                            </h3>
                                            <Badge variant={status.color} className="text-xs shrink-0 font-medium">
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-blue-600 font-medium mb-1 truncate">
                                            Re: {conv.item?.title || 'Listing'}
                                        </p>
                                        {conv.lastMessage ? (
                                            <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                                {isLastMsgMe && (
                                                    <span className="text-gray-400 font-normal">You: </span>
                                                )}
                                                {conv.lastMessage.content}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No messages yet. Tap to start chatting.</p>
                                        )}
                                    </div>

                                    {/* Timestamp and arrow */}
                                    <div className="shrink-0 text-right flex flex-col items-end gap-1.5 pl-2">
                                        {conv.lastMessage?.timestamp && (
                                            <span className="text-[11px] font-medium text-gray-400">
                                                {formatTimeAgo(conv.lastMessage.timestamp)}
                                            </span>
                                        )}
                                        <ArrowRight size={16} className="text-gray-400" />
                                    </div>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

