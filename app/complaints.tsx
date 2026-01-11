import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusPill } from "../components/StatusPill";
import { Colors } from "../constants/Colors";
import { Complaint } from "../types";

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "C001",
      subject: "AC not working in Section B",
      category: "Facility",
      status: "pending",
      date: "2025-08-10",
      priority: "Medium",
      description:
        "The air conditioning unit in Section B has been malfunctioning for 3 days.",
    },
    {
      id: "C002",
      subject: "Overtime payment delay",
      category: "Payroll",
      status: "resolved",
      date: "2025-08-05",
      priority: "High",
      description: "Overtime for July has not been credited yet.",
    },
  ]);
  const [formData, setFormData] = useState({
    subject: "",
    category: "General",
    priority: "Low",
    description: "",
  });

  useEffect(() => {
    // Load employee data if needed for future features
    AsyncStorage.getItem("employeeId");
  }, []);

  const submitComplaint = () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      Alert.alert("Required", "Please fill in subject and description");
      return;
    }

    const newComplaint = {
      id: "C" + String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
      ...formData,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };

    setComplaints([newComplaint as Complaint, ...complaints]);
    setFormData({
      subject: "",
      category: "General",
      priority: "Low",
      description: "",
    });
    Alert.alert("Success", "Complaint submitted successfully!");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return {
          bg: Colors.status.errorBg,
          text: Colors.status.errorText,
          border: Colors.status.error,
        };
      case "Medium":
        return {
          bg: Colors.status.warningBg,
          text: Colors.status.warningText,
          border: Colors.status.warning,
        };
      default:
        return {
          bg: Colors.status.successBg,
          text: Colors.status.successText,
          border: Colors.status.success,
        };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>Submit New Complaint</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput
            style={styles.input}
            value={formData.subject}
            onChangeText={(val) => setFormData({ ...formData, subject: val })}
            placeholder="Brief description of the issue"
            placeholderTextColor={Colors.slate[500]}
          />
        </View>

        <View style={styles.rowGroup}>
          <View style={styles.halfGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => {
                const categories = [
                  "General",
                  "Facility",
                  "Payroll",
                  "Safety",
                  "Management",
                  "Discrimination",
                  "Equipment",
                ];
                Alert.alert(
                  "Select Category",
                  "",
                  categories.map((c) => ({
                    text: c,
                    onPress: () => setFormData({ ...formData, category: c }),
                  }))
                );
              }}
            >
              <Text style={styles.pickerText}>{formData.category}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.halfGroup}>
            <Text style={styles.inputLabel}>Priority</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => {
                const priorities = ["Low", "Medium", "High"];
                Alert.alert(
                  "Select Priority",
                  "",
                  priorities.map((p) => ({
                    text: p,
                    onPress: () =>
                      setFormData({
                        ...formData,
                        priority: p as "Low" | "Medium" | "High",
                      }),
                  }))
                );
              }}
            >
              <Text style={styles.pickerText}>{formData.priority}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(val) =>
              setFormData({ ...formData, description: val })
            }
            placeholder="Provide detailed information about the issue..."
            placeholderTextColor={Colors.slate[500]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={submitComplaint}>
          <Text style={styles.submitButtonText}>Submit Complaint</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.cardTitle}>
          My Complaints ({complaints.length})
        </Text>
        {complaints.length === 0 && (
          <Text style={styles.emptyText}>No complaints submitted yet.</Text>
        )}
        {complaints.map((complaint) => {
          const priority = getPriorityColor(complaint.priority);
          return (
            <View key={complaint.id} style={styles.complaintItem}>
              <View style={styles.complaintHeader}>
                <View style={styles.complaintHeaderLeft}>
                  <Text style={styles.complaintSubject}>
                    {complaint.subject}
                  </Text>
                  <Text style={styles.complaintMeta}>
                    {complaint.id} • {complaint.category} • {complaint.date}
                  </Text>
                </View>
                <View style={styles.complaintHeaderRight}>
                  <StatusPill status={complaint.status} />
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: priority.bg,
                        borderColor: priority.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.priorityText, { color: priority.text }]}
                    >
                      {complaint.priority}
                    </Text>
                  </View>
                </View>
              </View>
              {complaint.description && (
                <View style={styles.complaintDescription}>
                  <Text style={styles.descriptionText}>
                    {complaint.description}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Anonymous Reporting</Text>
        <Text style={styles.infoText}>
          For sensitive issues, you can submit anonymous complaints through the
          HR hotline or suggestion box.
        </Text>
        <View style={styles.infoButtons}>
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoButtonText}>HR Hotline: 01711-XXXXXX</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoButtonText}>Suggestion Box (Floor 3)</Text>
          </TouchableOpacity>
        </View>
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
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  cardTitle: {
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
  textArea: {
    height: 100,
  },
  rowGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfGroup: {
    flex: 1,
  },
  picker: {
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 14,
    padding: 14,
  },
  pickerText: {
    color: Colors.slate[200],
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: Colors.brand.light,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: Colors.neutral[900],
    fontSize: 15,
    fontWeight: "700",
  },
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  emptyText: {
    color: Colors.slate[400],
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  complaintItem: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[800] + "33",
    marginBottom: 12,
  },
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  complaintHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  complaintSubject: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  complaintMeta: {
    color: Colors.slate[400],
    fontSize: 11,
  },
  complaintHeaderRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  complaintDescription: {
    padding: 12,
    backgroundColor: Colors.neutral[800] + "66",
    borderRadius: 10,
  },
  descriptionText: {
    color: Colors.slate[300],
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  infoTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    color: Colors.slate[400],
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoButtons: {
    gap: 8,
  },
  infoButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    alignItems: "center",
  },
  infoButtonText: {
    color: Colors.slate[200],
    fontSize: 13,
    fontWeight: "500",
  },
});
