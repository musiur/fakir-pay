import {
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationsScreen() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const filteredNotifications = activeTab === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle;
      case "warning": return AlertTriangle;
      case "error": return AlertTriangle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": return Colors.status.success;
      case "warning": return "#f59e0b";
      case "error": return Colors.status.error;
      default: return Colors.brand.light;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      default: return Colors.slate[400];
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleNotificationPress = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Show notification details
    Alert.alert(
      notification.title,
      `${notification.message}\n\nTime: ${new Date(notification.createdAt).toLocaleString()}\nPriority: ${notification.priority.toUpperCase()}\nReference: ${notification.type.toUpperCase()}-${notification.id.slice(-3)}`,
      [
        { text: "Delete", style: "destructive", onPress: () => removeNotification(notification.id) },
        { text: "Close", style: "cancel" }
      ]
    );
  };

  const handleMarkAllRead = () => {
    Alert.alert(
      "Mark All as Read",
      "Are you sure you want to mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Mark All Read", onPress: markAllAsRead }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.tabActive]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]} numberOfLines={1}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "unread" && styles.tabActive]}
            onPress={() => setActiveTab("unread")}
          >
            <Text style={[styles.tabText, activeTab === "unread" && styles.tabTextActive]} numberOfLines={1}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
            <CheckCircle size={16} color={Colors.brand.light} />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Info size={48} color={Colors.slate[400]} />
            <Text style={styles.emptyTitle}>
              {activeTab === "unread" ? "No unread notifications" : "No notifications"}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === "unread" 
                ? "All caught up! Check back later for updates."
                : "You'll see important updates and alerts here."
              }
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);
            
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationUnread
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: iconColor + "22" }]}>
                    <IconComponent size={20} color={iconColor} />
                  </View>
                </View>
                
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.notificationTitleUnread
                    ]}>
                      {notification.title}
                    </Text>
                    <View style={styles.notificationMeta}>
                      <View style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(notification.priority) }
                      ]} />
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.createdAt)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  
                  <View style={styles.notificationFooter}>
                    <Text style={styles.notificationPriority}>
                      {notification.priority.toUpperCase()}
                    </Text>
                    {!notification.read && (
                      <View style={styles.unreadIndicator} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    color: Colors.slate[200],
    fontSize: 24,
    fontWeight: "700",
  },
  headerBadge: {
    backgroundColor: Colors.status.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.neutral[800],
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  tabActive: {
    backgroundColor: Colors.brand.light,
  },
  tabText: {
    color: Colors.slate[400],
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 13,
  },
  tabTextActive: {
    color: Colors.neutral[900],
    fontWeight: "600",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-end",
  },
  markAllText: {
    color: Colors.brand.light,
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    color: Colors.slate[300],
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.slate[400],
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "33",
  },
  notificationUnread: {
    backgroundColor: Colors.neutral[900] + "66",
  },
  notificationLeft: {
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  notificationTitle: {
    color: Colors.slate[300],
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    color: Colors.slate[100],
    fontWeight: "600",
  },
  notificationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationTime: {
    color: Colors.slate[500],
    fontSize: 12,
  },
  notificationMessage: {
    color: Colors.slate[400],
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationPriority: {
    color: Colors.slate[500],
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.light,
  },
});
