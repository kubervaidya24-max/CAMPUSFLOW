import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { projectService } from '../services/projectService';

export const useProjectChat = (projectId) => {
  const { user, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [roomError, setRoomError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const typingTimeoutRef = useRef({});
  const socketRef = useRef(null);

  // 1. Initial REST Hydration of Message History
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useQuery({
    queryKey: ['projectMessages', projectId],
    queryFn: () => projectService.getProjectMessages(projectId, { limit: 100 }),
    enabled: Boolean(projectId && accessToken),
    staleTime: 1000 * 60 * 5,
  });

  // Sync initial REST messages into state
  useEffect(() => {
    if (historyData?.data?.messages) {
      setMessages(historyData.data.messages);
    }
  }, [historyData]);

  // 2. Socket Connection & Event Listeners
  useEffect(() => {
    if (!projectId || !accessToken) return;

    setRoomError(null);
    setConnectionStatus('connecting');

    const socket = socketService.getSocket(accessToken);
    socketRef.current = socket;

    if (!socket) return;

    const handleConnect = () => {
      setConnectionStatus('connected');
      socket.emit('join_project', { projectId });
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleConnectError = (err) => {
      setConnectionStatus('error');
      setRoomError(err.message || 'Failed to connect to chat server');
    };

    const handleRoomJoined = (data) => {
      if (data.projectId === projectId) {
        setRoomError(null);
        setConnectionStatus('connected');
        if (Array.isArray(data.onlineUsers)) {
          setOnlineUsers(data.onlineUsers);
        }
      }
    };

    const handleRoomError = (err) => {
      setConnectionStatus('error');
      setRoomError(err.message || 'Failed to join project room');
    };

    const handlePresenceUpdate = (data) => {
      if (data.projectId === projectId && Array.isArray(data.onlineUsers)) {
        setOnlineUsers(data.onlineUsers);
      }
    };

    const handleNewMessage = (data) => {
      if (data.projectId === projectId && data.message) {
        setMessages((prev) => {
          // Avoid duplicate messages
          const exists = prev.some((m) => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });

        // Invalidate history query cache
        queryClient.invalidateQueries({ queryKey: ['projectMessages', projectId] });
      }
    };

    const handleUserTyping = (data) => {
      if (data.projectId === projectId && data.user) {
        // Do not add current user
        if (data.user._id === user?._id) return;

        setTypingUsers((prev) => {
          if (!prev.some((u) => u._id === data.user._id)) {
            return [...prev, data.user];
          }
          return prev;
        });

        // Auto-clear typing indicator after 3 seconds of inactivity
        if (typingTimeoutRef.current[data.user._id]) {
          clearTimeout(typingTimeoutRef.current[data.user._id]);
        }

        typingTimeoutRef.current[data.user._id] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u._id !== data.user._id));
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.projectId === projectId && data.userId) {
        setTypingUsers((prev) => prev.filter((u) => u._id !== data.userId));
        if (typingTimeoutRef.current[data.userId]) {
          clearTimeout(typingTimeoutRef.current[data.userId]);
        }
      }
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room_joined', handleRoomJoined);
    socket.on('room_error', handleRoomError);
    socket.on('presence_update', handlePresenceUpdate);
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.emit('leave_project', { projectId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_error', handleRoomError);
      socket.off('presence_update', handlePresenceUpdate);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [projectId, accessToken, user?._id, queryClient]);

  // 3. Actions: Send Message & Typing
  const sendMessage = useCallback(
    async (content, attachments = []) => {
      if (!content || !content.trim() || !socketRef.current) return false;

      setIsSending(true);
      return new Promise((resolve) => {
        socketRef.current.emit(
          'send_message',
          {
            projectId,
            content: content.trim(),
            attachments,
          },
          (ack) => {
            setIsSending(false);
            if (ack?.success) {
              resolve(ack.message);
            } else {
              setRoomError(ack?.message || 'Failed to send message');
              resolve(false);
            }
          }
        );
      });
    },
    [projectId]
  );

  const startTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { projectId });
    }
  }, [projectId]);

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { projectId });
    }
  }, [projectId]);

  return {
    messages,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    onlineUsers,
    connectionStatus,
    roomError: roomError || historyError?.message,
    isLoading: isHistoryLoading,
    isSending,
  };
};

export default useProjectChat;
