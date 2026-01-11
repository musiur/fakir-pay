import { Tabs } from "expo-router";
import {
  Book,
  Clock,
  FileText,
  Home,
  MessageSquare,
  User,
} from "lucide-react-native";
import { Colors } from "../../constants/Colors";

export default function TabsLayout() {
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
          headerTitle: "Dashboard",
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
