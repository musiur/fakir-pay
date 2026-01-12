import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronDown, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import DatePicker from "../components/DatePicker";
import { Colors } from "../constants/Colors";
import { EMPLOYEES } from "../constants/Data";
import { Employee, LeaveRequest } from "../types";

export default function LeaveScreen() {
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([
    {
      id: "LV-301",
      type: "Annual",
      from: "2025-08-15",
      to: "2025-08-19",
      status: "approved",
    },
    {
      id: "LV-298",
      type: "Sick",
      from: "2025-08-05",
      to: "2025-08-06",
      status: "pending",
    },
    {
      id: "LV-285",
      type: "Casual",
      from: "2025-07-20",
      to: "2025-07-21",
      status: "approved",
    },
  ]);
  const [formData, setFormData] = useState({
    type: "",
    from: "",
    to: "",
  });

  const leaveTypes = ["Annual", "Sick", "Casual", "Maternity", "Emergency"];

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  const submitLeave = () => {
    if (!formData.type || !formData.from || !formData.to) {
      Alert.alert("Required", "Please complete all fields");
      return;
    }

    const newRequest: LeaveRequest = {
      id: `LV-${Math.floor(Math.random() * 900 + 100)}`,
      type: formData.type,
      from: formData.from,
      to: formData.to,
      status: "pending",
    };

    setRequests([newRequest, ...requests]);
    setFormData({ type: "", from: "", to: "" });
    Alert.alert("Success", "Leave request submitted successfully!");
  };

  const selectLeaveType = (type: string) => {
    setFormData({ ...formData, type });
    setShowLeaveTypeModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return Colors.status.success;
      case "pending":
        return "#f59e0b";
      case "rejected":
        return Colors.status.error;
      default:
        return Colors.slate[400];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Leave Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.cardTitle}>Leave Balance</Text>
          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>ANNUAL</Text>
              <Text style={styles.balanceValue}>
                {employee.leaveBalance.annual}
              </Text>
              <Text style={styles.balanceDays}>days</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>SICK</Text>
              <Text style={styles.balanceValue}>
                {employee.leaveBalance.sick}
              </Text>
              <Text style={styles.balanceDays}>days</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>CASUAL</Text>
              <Text style={styles.balanceValue}>
                {employee.leaveBalance.casual}
              </Text>
              <Text style={styles.balanceDays}>days</Text>
            </View>
          </View>
        </View>

        {/* Apply for Leave */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Apply for Leave</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Leave Type</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowLeaveTypeModal(true)}
            >
              <Text style={formData.type ? styles.pickerText : styles.pickerPlaceholder}>
                {formData.type || "Select leave type"}
              </Text>
              <ChevronDown size={16} color={Colors.slate[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateGrid}>
            <View style={styles.dateGroup}>
              <Text style={styles.inputLabel}>From Date</Text>
              <DatePicker
                value={formData.from}
                onDateChange={(date) => setFormData({ ...formData, from: date })}
                placeholder="Select start date"
                minDate={new Date()}
              />
            </View>
            <View style={styles.dateGroup}>
              <Text style={styles.inputLabel}>To Date</Text>
              <DatePicker
                value={formData.to}
                onDateChange={(date) => setFormData({ ...formData, to: date })}
                placeholder="Select end date"
                minDate={formData.from ? new Date(formData.from) : new Date()}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={submitLeave}>
            <Text style={styles.submitButtonText}>Submit Leave Request</Text>
          </TouchableOpacity>
        </View>

        {/* Leave History */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Leave History</Text>
          {requests.map((req) => (
            <View key={req.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyId}>
                  {req.id} — {req.type}
                </Text>
                <Text style={styles.historyDates}>
                  {formatDate(req.from)} → {formatDate(req.to)}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(req.status) + "22" }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(req.status) }
                ]}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Leave Type Selection Modal */}
      <Modal
        visible={showLeaveTypeModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Leave Type</Text>
              <TouchableOpacity onPress={() => setShowLeaveTypeModal(false)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>
            <View style={styles.leaveTypeList}>
              {leaveTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.leaveTypeItem,
                    formData.type === type && styles.leaveTypeItemActive
                  ]}
                  onPress={() => selectLeaveType(type)}
                >
                  <Text style={[
                    styles.leaveTypeText,
                    formData.type === type && styles.leaveTypeTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  balanceItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[800] + "33",
    padding: 16,
    alignItems: "center",
  },
  balanceLabel: {
    color: Colors.slate[400],
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 8,
  },
  balanceValue: {
    color: Colors.slate[100],
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceDays: {
    color: Colors.slate[500],
    fontSize: 12,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  picker: {
    backgroundColor: Colors.neutral[800],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerText: {
    color: Colors.slate[200],
    fontSize: 14,
  },
  pickerPlaceholder: {
    color: Colors.slate[500],
    fontSize: 14,
  },
  dateGrid: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  dateGroup: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.brand.light,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "600",
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  historyLeft: {
    flex: 1,
  },
  historyId: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  historyDates: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.neutral[900],
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  modalTitle: {
    color: Colors.slate[200],
    fontSize: 18,
    fontWeight: "600",
  },
  leaveTypeList: {
    padding: 20,
  },
  leaveTypeItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.neutral[800],
  },
  leaveTypeItemActive: {
    backgroundColor: Colors.brand.light + "22",
    borderWidth: 1,
    borderColor: Colors.brand.light,
  },
  leaveTypeText: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "500",
  },
  leaveTypeTextActive: {
    color: Colors.brand.light,
    fontWeight: "600",
  },
});
