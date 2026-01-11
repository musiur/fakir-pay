import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "../../components/Avatar";
import { Colors } from "../../constants/Colors";
import { EMPLOYEES } from "../../constants/Data";
import { Employee } from "../../types";

export default function ProfileScreen() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);
  const [phone, setPhone] = useState("");
  const [emergency, setEmergency] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) {
        setEmployee(emp);
        setPhone(emp.phone);
        setEmergency(emp.emergency);
      }
    });
  }, []);

  const saveProfile = () => {
    Alert.alert(
      "Success",
      "Profile saved! (Demo mode - changes are not persisted)"
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("employeeId");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar name={employee.name} color={Colors.brand.light} size={70} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{employee.name}</Text>
              <Text style={styles.profileDesignation}>
                {employee.designation}
              </Text>
              <Text style={styles.profileDepartment}>
                {employee.department}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Employee ID</Text>
              <Text style={styles.infoValue}>{employee.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Join Date</Text>
              <Text style={styles.infoValue}>
                {new Date(employee.joinDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shift</Text>
              <Text style={styles.infoValue}>{employee.shift}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Biometrics</Text>
              <View
                style={[
                  styles.biometricBadge,
                  employee.biometricsEnabled
                    ? styles.biometricEnabled
                    : styles.biometricDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.biometricText,
                    employee.biometricsEnabled
                      ? styles.biometricTextEnabled
                      : styles.biometricTextDisabled,
                  ]}
                >
                  {employee.biometricsEnabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Contact Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={Colors.slate[500]}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              value={emergency}
              onChangeText={setEmergency}
              placeholder="Enter emergency contact"
              placeholderTextColor={Colors.slate[500]}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.demoNotice}>
            Note: This is a demo. Changes are not permanently saved.
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, saved && styles.saveButtonSuccess]}
            onPress={saveProfile}
          >
            <Text style={styles.saveButtonText}>
              {saved ? "Saved ✓" : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.leaveCard}>
          <Text style={styles.leaveTitle}>Leave Balance</Text>
          <View style={styles.leaveGrid}>
            <View style={styles.leaveItem}>
              <Text style={styles.leaveLabel}>ANNUAL</Text>
              <Text style={styles.leaveValue}>
                {employee.leaveBalance.annual}
              </Text>
              <Text style={styles.leaveDays}>days</Text>
            </View>
            <View style={styles.leaveItem}>
              <Text style={styles.leaveLabel}>SICK</Text>
              <Text style={styles.leaveValue}>
                {employee.leaveBalance.sick}
              </Text>
              <Text style={styles.leaveDays}>days</Text>
            </View>
            <View style={styles.leaveItem}>
              <Text style={styles.leaveLabel}>CASUAL</Text>
              <Text style={styles.leaveValue}>
                {employee.leaveBalance.casual}
              </Text>
              <Text style={styles.leaveDays}>days</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors.slate[100],
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileDesignation: {
    color: Colors.slate[400],
    fontSize: 14,
    marginBottom: 2,
  },
  profileDepartment: {
    color: Colors.slate[500],
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[800],
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
  },
  biometricBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  biometricEnabled: {
    backgroundColor: Colors.status.successBg,
  },
  biometricDisabled: {
    backgroundColor: Colors.status.errorBg,
  },
  biometricText: {
    fontSize: 12,
    fontWeight: "600",
  },
  biometricTextEnabled: {
    color: Colors.status.successText,
  },
  biometricTextDisabled: {
    color: Colors.status.errorText,
  },
  editCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  editTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.slate[400],
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 14,
    padding: 14,
    color: Colors.slate[200],
    fontSize: 14,
  },
  demoNotice: {
    color: Colors.slate[500],
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: Colors.brand.light,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonSuccess: {
    backgroundColor: Colors.status.success,
  },
  saveButtonText: {
    color: Colors.neutral[900],
    fontSize: 15,
    fontWeight: "700",
  },
  leaveCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  leaveTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  leaveGrid: {
    flexDirection: "row",
    gap: 12,
  },
  leaveItem: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    padding: 16,
    alignItems: "center",
  },
  leaveLabel: {
    color: Colors.slate[400],
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 8,
  },
  leaveValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  leaveDays: {
    color: Colors.slate[500],
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.status.error,
    backgroundColor: Colors.status.error + "1A",
  },
  logoutText: {
    color: Colors.status.error,
    fontSize: 15,
    fontWeight: "700",
  },
});
