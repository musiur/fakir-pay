import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Colors";
import { NotificationProvider } from "../hooks/useNotifications";

export default function RootLayout() {
  return (
    <NotificationProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.neutral[950] },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="leave"
          options={{
            presentation: "modal",
            headerShown: true,
            headerStyle: { backgroundColor: Colors.neutral[950] },
            headerTintColor: Colors.slate[200],
            title: "Leave",
          }}
        />
        <Stack.Screen
          name="payroll"
          options={{
            presentation: "modal",
            headerShown: true,
            headerStyle: { backgroundColor: Colors.neutral[950] },
            headerTintColor: Colors.slate[200],
            title: "Payroll",
          }}
        />
        <Stack.Screen
          name="complaints"
          options={{
            presentation: "modal",
            headerShown: true,
            headerStyle: { backgroundColor: Colors.neutral[950] },
            headerTintColor: Colors.slate[200],
            title: "Complaints & Grievances",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            presentation: "modal",
            headerShown: true,
            headerStyle: { backgroundColor: Colors.neutral[950] },
            headerTintColor: Colors.slate[200],
            title: "Notifications",
          }}
        />
      </Stack>
    </NotificationProvider>
  );
}
