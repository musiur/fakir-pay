import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Notification } from "../types";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock initial notifications for demo purposes
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Leave Request Approved',
        message: 'Your annual leave request for Dec 25-26 has been approved.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
        priority: 'medium',
      },
      {
        id: '2',
        title: 'New Document Available',
        message: 'Updated employee handbook is now available in Knowledge Base.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        priority: 'low',
      },
      {
        id: '3',
        title: 'Attendance Reminder',
        message: 'Please remember to clock out before leaving today.',
        type: 'warning',
        read: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        priority: 'high',
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};