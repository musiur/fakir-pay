import {
  Calendar,
  Edit,
  FileText,
  Fingerprint,
  MapPin,
  Move,
  X
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DatePicker from "../../components/DatePicker";
import { StatusPill } from "../../components/StatusPill";
import TimePicker from "../../components/TimePicker";
import { Colors } from "../../constants/Colors";
import { ATTENDANCE_HISTORY } from "../../constants/Data";
import { AttendanceRecord } from "../../types";

interface QSRequest {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  reason: string;
  status: "Approved" | "Pending";
  submittedDate: string;
  approvedBy?: string;
}

interface MovementRequest {
  id: string;
  date: string;
  time: string;
  returnTime?: string;
  destination: string;
  purpose: string;
  status: "Completed" | "Pending";
  submittedDate: string;
}

export default function AttendanceScreen() {
  const [step, setStep] = useState<"zone" | "biometric" | "success">("zone");
  const [geofenceOk, setGeofenceOk] = useState(true);
  const [clocked, setClocked] = useState(false);
  const [history, setHistory] = useState<AttendanceRecord[]>(ATTENDANCE_HISTORY);
  
  // Modal states
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showQSModal, setShowQSModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [requestTab, setRequestTab] = useState<"qs" | "movement">("movement");
  
  // Form states
  const [qsForm, setQSForm] = useState({
    date: "",
    clockIn: "",
    clockOut: "",
    reason: ""
  });
  
  const [movementForm, setMovementForm] = useState({
    date: "",
    departureTime: "",
    returnTime: "",
    destination: "",
    purpose: ""
  });
  
  const [editForm, setEditForm] = useState({
    clockIn: "05:58",
    clockOut: "14:03"
  });

  // Mock data
  const [qsRequests] = useState<QSRequest[]>([
    {
      id: "QSA-001",
      date: "2025-11-25",
      clockIn: "09:05",
      clockOut: "18:00",
      reason: "Biometric device was not working properly in the morning",
      status: "Approved",
      submittedDate: "2025-11-25",
      approvedBy: "Division Head on 2025-11-26"
    },
    {
      id: "QSA-002",
      date: "2025-11-20",
      clockIn: "09:00",
      clockOut: "18:15",
      reason: "Forgot to clock out, was in a meeting",
      status: "Pending",
      submittedDate: "2025-11-21"
    }
  ]);

  const [movementRequests] = useState<MovementRequest[]>([
    {
      id: "MR-001",
      date: "2025-11-29",
      time: "14:00 - 16:00",
      returnTime: "15:45",
      destination: "Buyer Office - Gulshan",
      purpose: "Meeting with buyer to discuss Q1 2026 orders and sample approval",
      status: "Completed",
      submittedDate: "2025-11-28"
    },
    {
      id: "MR-002",
      date: "2025-11-30",
      time: "10:00 - 12:00",
      destination: "Bank - Motijheel",
      purpose: "LC documentation and payment processing",
      status: "Pending",
      submittedDate: "2025-11-29"
    },
    {
      id: "MR-004",
      date: "2025-12-01",
      time: "09:00 - 11:00",
      destination: "Supplier Office",
      purpose: "Quality inspection and delivery coordination",
      status: "Completed",
      submittedDate: "2025-11-30"
    }
  ]);

  const proceedToBiometric = () => {
    if (!geofenceOk) {
      Alert.alert(
        "Location Required",
        "You need to be inside the Fakir Zone to clock in/out!"
      );
      return;
    }
    setStep("biometric");
  };

  const completeBiometric = () => {
    setStep("success");
    setClocked(!clocked);

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const today = new Date().toISOString().split("T")[0];

    setHistory((prev) => {
      const idx = prev.findIndex((x) => x.date === today);
      if (idx > -1) {
        const copy = [...prev];
        if (copy[idx].clockIn && copy[idx].clockIn !== "-") {
          copy[idx].clockOut = `${hh}:${mm}`;
        } else {
          copy[idx].clockIn = `${hh}:${mm}`;
        }
        copy[idx].status = "Present";
        return copy;
      }
      return [
        {
          date: today,
          status: "Present",
          clockIn: `${hh}:${mm}`,
          clockOut: "-",
          late: false,
        },
        ...prev,
      ];
    });

    setTimeout(() => setStep("zone"), 2000);
  };

  const handleQSSubmit = () => {
    Alert.alert("Success", "QS Attendance request submitted successfully");
    setShowQSModal(false);
    setQSForm({ date: "", clockIn: "", clockOut: "", reason: "" });
  };

  const handleMovementSubmit = () => {
    Alert.alert("Success", "Movement request submitted successfully");
    setShowMovementModal(false);
    setMovementForm({ date: "", departureTime: "", returnTime: "", destination: "", purpose: "" });
  };

  const handleEditSubmit = () => {
    Alert.alert("Success", "Attendance times updated successfully");
    setShowEditModal(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {step === "zone" && (
        <View style={styles.card}>
          <View
            style={[
              styles.zoneIcon,
              geofenceOk ? styles.zoneIconSuccess : styles.zoneIconError,
            ]}
          >
            <MapPin
              size={40}
              color={geofenceOk ? Colors.status.success : Colors.status.error}
            />
          </View>

          <Text
            style={[
              styles.zoneTitle,
              geofenceOk ? styles.zoneTitleSuccess : styles.zoneTitleError,
            ]}
          >
            {geofenceOk ? "You're in Fakir Zone!" : "Outside Fakir Zone"}
          </Text>

          <Text style={styles.zoneDescription}>
            {geofenceOk
              ? "Great! You're within the factory premises and can clock in/out."
              : "You need to be inside the factory premises to clock in/out."}
          </Text>

          <TouchableOpacity
            style={[
              styles.clockButton,
              !geofenceOk && styles.clockButtonDisabled,
            ]}
            onPress={proceedToBiometric}
            disabled={!geofenceOk}
          >
            <Text style={styles.clockButtonText}>
              {clocked ? "Clock Out" : "Clock In"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "biometric" && (
        <View style={styles.card}>
          <View style={styles.biometricIcon}>
            <Fingerprint size={50} color={Colors.status.info} />
          </View>

          <Text style={styles.biometricTitle}>Biometric Required</Text>
          <Text style={styles.biometricDescription}>
            Place your finger on the sensor to clock in
          </Text>

          <TouchableOpacity
            style={styles.biometricButton}
            onPress={completeBiometric}
          >
            <Fingerprint size={60} color={Colors.status.info} />
            <Text style={styles.biometricButtonText}>Touch Sensor</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "success" && (
        <View style={styles.card}>
          <View style={styles.successIcon}>
            <Text style={styles.successCheckmark}>✓</Text>
          </View>

          <Text style={styles.successTitle}>Success!</Text>
          <Text style={styles.successDescription}>
            You have successfully {clocked ? "clocked out" : "clocked in"}
          </Text>
        </View>
      )}

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Calendar size={24} color={Colors.brand.light} />
          <Text style={styles.quickActionText}>Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowQSModal(true)}
        >
          <Edit size={24} color={Colors.brand.light} />
          <Text style={styles.quickActionText}>QS Request</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowMovementModal(true)}
        >
          <Move size={24} color={Colors.brand.light} />
          <Text style={styles.quickActionText}>Movement</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowRequestsModal(true)}
        >
          <FileText size={24} color={Colors.brand.light} />
          <Text style={styles.quickActionText}>Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Attendance */}
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Recent Attendance</Text>
        <View style={styles.historyList}>
          {history.slice(0, 3).map((record, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyDate}>{record.date}</Text>
                <Text style={styles.historyTime}>
                  In: {record.clockIn} • Out: {record.clockOut}
                </Text>
              </View>
              <View style={styles.historyItemRight}>
                <StatusPill status={record.status.toLowerCase()} />
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setShowEditModal(true)}
                >
                  <Edit size={16} color={Colors.brand.light} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Requests Modal */}
      <Modal
        visible={showRequestsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Requests</Text>
            <TouchableOpacity onPress={() => setShowRequestsModal(false)}>
              <X size={24} color={Colors.slate[400]} />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                requestTab === "qs" && styles.activeTab
              ]}
              onPress={() => setRequestTab("qs")}
            >
              <Text style={[
                styles.tabText,
                requestTab === "qs" && styles.activeTabText
              ]}>
                QS Attendance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                requestTab === "movement" && styles.activeTab
              ]}
              onPress={() => setRequestTab("movement")}
            >
              <Text style={[
                styles.tabText,
                requestTab === "movement" && styles.activeTabText
              ]}>
                Movement Register
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {requestTab === "qs" ? (
              <View style={styles.requestsList}>
                {qsRequests.map((request) => (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestId}>{request.id}</Text>
                      <StatusPill status={request.status.toLowerCase()} />
                    </View>
                    <Text style={styles.requestLabel}>Date: <Text style={styles.requestValue}>{request.date}</Text></Text>
                    <Text style={styles.requestLabel}>In: <Text style={styles.requestValue}>{request.clockIn}</Text> • Out: <Text style={styles.requestValue}>{request.clockOut}</Text></Text>
                    <Text style={styles.requestReason}>{request.reason}</Text>
                    <Text style={styles.requestSubmitted}>Submitted: {request.submittedDate}</Text>
                    {request.approvedBy && (
                      <Text style={styles.requestApproved}>Approved by: {request.approvedBy}</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.requestsList}>
                {movementRequests.map((request) => (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestId}>{request.id}</Text>
                      <StatusPill status={request.status.toLowerCase()} />
                    </View>
                    <Text style={styles.requestLabel}>Date: <Text style={styles.requestValue}>{request.date}</Text></Text>
                    <Text style={styles.requestLabel}>Time: <Text style={styles.requestValue}>{request.time}</Text></Text>
                    {request.returnTime && (
                      <Text style={styles.requestLabel}>Returned: <Text style={styles.requestValue}>{request.returnTime}</Text></Text>
                    )}
                    <Text style={styles.requestLabel}>Destination: <Text style={styles.requestValue}>{request.destination}</Text></Text>
                    <Text style={styles.requestReason}>{request.purpose}</Text>
                    <Text style={styles.requestSubmitted}>Submitted: {request.submittedDate}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowRequestsModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* QS Request Modal */}
      <Modal
        visible={showQSModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>QS Attendance Request</Text>
            <TouchableOpacity onPress={() => setShowQSModal(false)}>
              <X size={24} color={Colors.slate[400]} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>Submit a request to correct your attendance record</Text>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <DatePicker
                value={qsForm.date}
                onDateChange={(date) => setQSForm({...qsForm, date: date})}
                placeholder="Select date"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Clock In Time</Text>
              <TimePicker
                value={qsForm.clockIn}
                onTimeChange={(time) => setQSForm({...qsForm, clockIn: time})}
                placeholder="Select clock in time"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Clock Out Time</Text>
              <TimePicker
                value={qsForm.clockOut}
                onTimeChange={(time) => setQSForm({...qsForm, clockOut: time})}
                placeholder="Select clock out time"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reason</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Explain why you need this correction..."
                placeholderTextColor={Colors.slate[500]}
                multiline
                numberOfLines={4}
                value={qsForm.reason}
                onChangeText={(text) => setQSForm({...qsForm, reason: text})}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleQSSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowQSModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Movement Request Modal */}
      <Modal
        visible={showMovementModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Movement Register</Text>
            <TouchableOpacity onPress={() => setShowMovementModal(false)}>
              <X size={24} color={Colors.slate[400]} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>Request permission to leave the factory premises</Text>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date <Text style={styles.required}>*</Text></Text>
              <DatePicker
                value={movementForm.date}
                onDateChange={(date) => setMovementForm({...movementForm, date: date})}
                placeholder="Select movement date"
                minDate={new Date()} // Prevent selecting past dates
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Departure Time <Text style={styles.required}>*</Text></Text>
              <TimePicker
                value={movementForm.departureTime}
                onTimeChange={(time) => setMovementForm({...movementForm, departureTime: time})}
                placeholder="Select departure time"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Expected Return Time <Text style={styles.required}>*</Text></Text>
              <TimePicker
                value={movementForm.returnTime}
                onTimeChange={(time) => setMovementForm({...movementForm, returnTime: time})}
                placeholder="Select return time"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Destination <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Buyer Office - Gulshan, Bank - Motijheel"
                placeholderTextColor={Colors.slate[500]}
                value={movementForm.destination}
                onChangeText={(text) => setMovementForm({...movementForm, destination: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Purpose <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Explain the reason for leaving factory premises..."
                placeholderTextColor={Colors.slate[500]}
                multiline
                numberOfLines={4}
                value={movementForm.purpose}
                onChangeText={(text) => setMovementForm({...movementForm, purpose: text})}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleMovementSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMovementModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Attendance Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Attendance Times</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color={Colors.slate[400]} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>Update clock in/out times for 2025-08-11</Text>

          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Clock In Time</Text>
              <TimePicker
                value={editForm.clockIn}
                onTimeChange={(time) => setEditForm({...editForm, clockIn: time})}
                placeholder="Select clock in time"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Clock Out Time</Text>
              <TimePicker
                value={editForm.clockOut}
                onTimeChange={(time) => setEditForm({...editForm, clockOut: time})}
                placeholder="Select clock out time"
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEditSubmit}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 24,
    alignItems: "center",
  },
  zoneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  zoneIconSuccess: {
    backgroundColor: Colors.status.success + "33",
    borderColor: Colors.status.success,
  },
  zoneIconError: {
    backgroundColor: Colors.status.error + "33",
    borderColor: Colors.status.error,
  },
  zoneTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  zoneTitleSuccess: {
    color: Colors.status.success,
  },
  zoneTitleError: {
    color: Colors.status.error,
  },
  zoneDescription: {
    color: Colors.slate[300],
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  clockButton: {
    width: "100%",
    backgroundColor: Colors.brand.light,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  clockButtonDisabled: {
    backgroundColor: Colors.neutral[700],
    opacity: 0.5,
  },
  clockButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "700",
  },
  biometricIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.status.info + "33",
    borderWidth: 2,
    borderColor: Colors.status.info,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  biometricTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.status.info,
    marginBottom: 12,
  },
  biometricDescription: {
    color: Colors.slate[300],
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  biometricButton: {
    width: "100%",
    padding: 50,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.status.info,
    backgroundColor: Colors.status.info + "1A",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  biometricButtonText: {
    color: Colors.status.info,
    fontSize: 16,
    fontWeight: "600",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.status.success + "33",
    borderWidth: 2,
    borderColor: Colors.status.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successCheckmark: {
    fontSize: 40,
    color: Colors.status.success,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.status.success,
    marginBottom: 12,
  },
  successDescription: {
    color: Colors.slate[300],
    fontSize: 14,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.neutral[900] + "CC",
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    color: Colors.slate[300],
    fontSize: 12,
    fontWeight: "500",
  },
  historyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    overflow: "hidden",
  },
  historyTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    padding: 20,
    paddingBottom: 16,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyDate: {
    color: Colors.slate[100],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  historyTime: {
    color: Colors.slate[400],
    fontSize: 14,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.neutral[800],
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
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
    color: Colors.slate[100],
    fontSize: 20,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: Colors.slate[400],
    fontSize: 14,
    padding: 20,
    paddingTop: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.neutral[900],
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: Colors.brand.light,
  },
  tabText: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.neutral[900],
    fontWeight: "600",
  },
  requestsList: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: Colors.neutral[900],
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestId: {
    color: Colors.slate[100],
    fontSize: 16,
    fontWeight: "600",
  },
  requestLabel: {
    color: Colors.slate[400],
    fontSize: 14,
    marginBottom: 4,
  },
  requestValue: {
    color: Colors.slate[200],
    fontWeight: "500",
  },
  requestReason: {
    color: Colors.slate[300],
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  requestSubmitted: {
    color: Colors.slate[500],
    fontSize: 12,
    marginBottom: 4,
  },
  requestApproved: {
    color: Colors.slate[500],
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  required: {
    color: Colors.status.error,
  },
  formInput: {
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    padding: 16,
    color: Colors.slate[100],
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  timeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  timeInputField: {
    flex: 1,
    padding: 16,
    color: Colors.slate[100],
    fontSize: 16,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateInputField: {
    flex: 1,
    padding: 16,
    color: Colors.slate[100],
    fontSize: 16,
  },
  modalActions: {
    padding: 20,
    gap: 12,
  },
  submitButton: {
    backgroundColor: Colors.brand.light,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "transparent",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.slate[400],
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: Colors.neutral[800],
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
  },
  closeButtonText: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
  },
});