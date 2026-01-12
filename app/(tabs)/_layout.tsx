import { Tabs, useRouter } from "expo-router";
import {
  Bell,
  Book,
  Clock,
  FileText,
  Home,
  MessageSquare,
  User,
} from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Logo } from "../../components/Logo";
import { NotificationBadge } from "../../components/NotificationBadge";
import { Colors } from "../../constants/Colors";
import { useNotifications } from "../../hooks/useNotifications";

export default function TabsLayout() {
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const LogoComponent = () => (
    <View style={{ marginLeft: -24 }}>
      <Logo size="large" />
    </View>
  );

  const NotificationButton = () => (
    <TouchableOpacity 
      style={{ position: 'relative', marginRight: 16 }}
      onPress={() => router.push("/notifications")}
    >
      <Bell size={24} color={Colors.slate[200]} />
      <NotificationBadge count={unreadCount} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.neutral[950],
          borderTopColor: Colors.neutral[800],
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.brand.light,
        tabBarInactiveTintColor: Colors.slate[400],
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: Colors.neutral[950],
          borderBottomColor: Colors.neutral[800],
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.slate[200],
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "",
          headerLeft: () => <LogoComponent />,
          headerRight: () => <NotificationButton />,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "ask FFL",
          headerTitle: "",
          headerLeft: () => <LogoComponent />,
          headerRight: () => <NotificationButton />,
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="esign"
        options={{
          title: "E-Sign",
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kb"
        options={{
          title: "KB",
          headerTitle: "Knowledge Base",
          tabBarIcon: ({ color, size }) => <Book size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
