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
        title: 'SOP Updated: Fire Drill Procedure',
        message: 'Fire Drill Procedure v3.2 has been updated. Please review the new evacuation routes and assembly points.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
        priority: 'high',
      },
      {
        id: '2',
        title: 'Company Holiday: Victory Day',
        message: 'The factory will be closed on December 16, 2025 for Victory Day. Regular operations will resume on December 17.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
        priority: 'medium',
      },
      {
        id: '3',
        title: 'Document Ready for Signature',
        message: 'Policy Acknowledgement 2025 requires your signature. Please review and sign by December 2.',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
        priority: 'high',
      },
      {
        id: '4',
        title: 'Leave Application Approved',
        message: 'Your annual leave request for December 20-22, 2025 has been approved by your manager.',
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1d ago
        priority: 'medium',
      },
      {
        id: '5',
        title: 'Movement Request Approved',
        message: 'Your movement request to Bank - Motijheel on November 30 has been approved by Division Manager.',
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
        priority: 'medium',
      },
      {
        id: '6',
        title: 'Payroll Update',
        message: 'Your November 2025 payslip is now available for download in the Payroll section.',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago
        priority: 'low',
      },
      {
        id: '7',
        title: 'System Maintenance',
        message: 'Scheduled maintenance on December 1, 2025 from 2:00 AM to 4:00 AM. Some features may be unavailable.',
        type: 'warning',
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3d ago
        priority: 'medium',
      },
      {
        id: '8',
        title: 'Training Session Reminder',
        message: 'Mandatory safety training session scheduled for December 5, 2025 at 10:00 AM in Conference Room A.',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4d ago
        priority: 'high',
      },
      {
        id: '9',
        title: 'Overtime Request Approved',
        message: 'Your overtime request for November 28, 2025 has been approved. Additional compensation will be included in next payroll.',
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5d ago
        priority: 'low',
      },
      {
        id: '10',
        title: 'New Policy Update',
        message: 'Updated Remote Work Policy is now available in Knowledge Base. Please review the new guidelines.',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1w ago
        priority: 'medium',
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