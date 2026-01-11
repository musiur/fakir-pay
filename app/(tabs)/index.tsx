import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  Book,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  MessageSquare,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { QuickTile } from "../../components/QuickTile";
import { Colors } from "../../constants/Colors";
import { EMPLOYEES } from "../../constants/Data";
import { Employee } from "../../types";

export default function DashboardScreen() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeLabel}>Welcome</Text>
            <Text style={styles.welcomeName}>{employee.name}</Text>
            <Text style={styles.welcomeDetail}>
              {employee.designation} • {employee.department}
            </Text>
          </View>
          <View style={styles.welcomeRight}>
            <Text style={styles.shiftLabel}>SHIFT</Text>
            <Text style={styles.shiftValue}>{employee.shift}</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        <QuickTile
          icon={Book}
          title="Knowledge Base"
          caption="SOPs & Docs"
          color={Colors.brand.light}
          onPress={() => router.push("/(tabs)/kb")}
        />
        <QuickTile
          icon={Clock}
          title="Attendance"
          caption="Clock in/out"
          color={Colors.brand.light}
          onPress={() => router.push("/(tabs)/attendance")}
        />
        <QuickTile
          icon={Calendar}
          title="Leave"
          caption="Apply / Balance"
          onPress={() => router.push("/leave")}
        />
        <QuickTile
          icon={CreditCard}
          title="Payroll"
          caption="Payslips"
          onPress={() => router.push("/leave")}
        />
        <QuickTile
          icon={MessageSquare}
          title="ask FFL"
          caption="AI Chatbot"
          onPress={() => router.push("/(tabs)/ai")}
        />
        <QuickTile
          icon={FileText}
          title="E-Sign"
          caption="Sign & Approvals"
          onPress={() => router.push("/(tabs)/esign")}
        />
        <QuickTile
          icon={AlertTriangle}
          title="Complaints"
          caption="Report Issues"
          color="#ef4444"
          onPress={() => router.push("/complaints")}
        />
        <QuickTile
          icon={User}
          title="Profile"
          caption="Personal Info"
          onPress={() => router.push("/(tabs)/profile")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeLabel: {
    color: Colors.slate[200],
    fontSize: 14,
  },
  welcomeName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  welcomeDetail: {
    color: Colors.slate[400],
    fontSize: 13,
    marginTop: 6,
  },
  welcomeRight: {
    alignItems: "flex-end",
  },
  shiftLabel: {
    color: Colors.slate[400],
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "600",
  },
  shiftValue: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  grid: {
    gap: 14,
  },
});
