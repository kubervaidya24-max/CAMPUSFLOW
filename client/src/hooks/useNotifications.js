import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { socketService } from '../services/socketService';

export const useNotifications = () => {
  const { isAuthenticated, accessToken } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Notifications List
  const {
    data: notifsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications({ limit: 30 }),
    enabled: Boolean(isAuthenticated && accessToken),
    staleTime: 1000 * 30, // 30 seconds
  });

  const notifications = notifsData?.data?.notifications || [];

  // 2. Fetch Unread Count
  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: Boolean(isAuthenticated && accessToken),
    staleTime: 1000 * 30,
  });

  const unreadCount = countData?.data?.unreadCount ?? 0;

  // 3. Real-Time Socket.IO Listener for targeted notifications
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = socketService.getSocket(accessToken);
    if (!socket) return;

    const handleNewNotification = (data) => {
      if (data?.notification) {
        // Prepend to notifications list cache
        queryClient.setQueryData(['notifications'], (old) => {
          if (!old?.data?.notifications) return old;
          const exists = old.data.notifications.some(
            (n) => n._id === data.notification._id
          );
          if (exists) return old;
          return {
            ...old,
            data: {
              ...old.data,
              notifications: [data.notification, ...old.data.notifications],
              unreadCount: (old.data.unreadCount || 0) + 1,
            },
          };
        });

        // Increment unread count in cache
        queryClient.setQueryData(['notifications', 'unreadCount'], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              unreadCount: (old.data.unreadCount || 0) + 1,
            },
          };
        });
      }
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [isAuthenticated, accessToken, queryClient]);

  // 4. Mark Single as Read Mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
    onSuccess: (res, notificationId) => {
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old?.data?.notifications) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n) =>
              n._id === notificationId ? { ...n, read: true } : n
            ),
          },
        };
      });

      queryClient.setQueryData(['notifications', 'unreadCount'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            unreadCount: Math.max((old.data.unreadCount || 0) - 1, 0),
          },
        };
      });
    },
  });

  // 5. Mark All as Read Mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old?.data?.notifications) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n) => ({ ...n, read: true })),
          },
        };
      });

      queryClient.setQueryData(['notifications', 'unreadCount'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            unreadCount: 0,
          },
        };
      });
    },
  });

  const markAsRead = useCallback(
    (notificationId) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

export default useNotifications;
