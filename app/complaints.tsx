import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ChevronDown, Phone, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { EMPLOYEES } from "../constants/Data";
import { Complaint, Employee } from "../types";

interface Suggestion {
  id: string;
  text: string;
  date: string;
  status: "Pending" | "Reviewed" | "Implemented";
}

export default function ComplaintsScreen() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "C001",
      subject: "AC not working in Section B",
      category: "Facility",
      status: "pending",
      date: "2025-08-10",
      priority: "Medium",
      description: "The air conditioning unit in Section B has been malfunctioning for 3 days.",
    },
    {
      id: "C002",
      subject: "Overtime payment delay",
      category: "Payroll",
      status: "pending",
      date: "2025-08-05",
      priority: "High",
      description: "Overtime for July has not been credited yet.",
    },
  ]);
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "S001",
      text: "Please add more vegetarian options in the canteen.",
      date: "2025-08-12",
      status: "Reviewed",
    },
  ]);

  const [formData, setFormData] = useState({
    subject: "",
    category: "General",
    priority: "Low",
    description: "",
  });

  const [suggestionText, setSuggestionText] = useState("");

  const categories = ["General", "Facility", "Payroll", "Safety", "Management", "Discrimination", "Equipment"];
  const priorities = ["Low", "Medium", "High"];

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  const submitComplaint = () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      Alert.alert("Required", "Please fill in subject and description");
      return;
    }

    const newComplaint: Complaint = {
      id: "C" + String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
      subject: formData.subject,
      category: formData.category,
      priority: formData.priority as "Low" | "Medium" | "High",
      description: formData.description,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };

    setComplaints([newComplaint, ...complaints]);
    setFormData({
      subject: "",
      category: "General",
      priority: "Low",
      description: "",
    });
    Alert.alert("Success", "Complaint submitted successfully!");
  };

  const submitSuggestion = () => {
    if (!suggestionText.trim()) {
      Alert.alert("Required", "Please enter your suggestion");
      return;
    }

    const newSuggestion: Suggestion = {
      id: "S" + String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
      text: suggestionText,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    setSuggestions([newSuggestion, ...suggestions]);
    setSuggestionText("");
    setShowSuggestionModal(false);
    Alert.alert("Success", "Suggestion submitted successfully!");
  };

  const handleHotlineCall = () => {
    Alert.alert(
      "HR Hotline",
      "Call HR for anonymous reporting and urgent issues.\n\nPhone: +880 1711-234567",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call Now", onPress: () => Alert.alert("Demo", "In a real app, this would open the phone dialer") }
      ]
    );
  };

  const selectCategory = (category: string) => {
    setFormData({ ...formData, category });
    setShowCategoryModal(false);
  };

  const selectPriority = (priority: string) => {
    setFormData({ ...formData, priority });
    setShowPriorityModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return Colors.status.error;
      case "Medium":
        return "#f59e0b";
      default:
        return Colors.brand.light;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return Colors.status.success;
      case "pending":
        return "#f59e0b";
      default:
        return Colors.slate[400];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Submit New Complaint Form */}
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
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.pickerText}>{formData.category}</Text>
                <ChevronDown size={16} color={Colors.slate[400]} />
              </TouchableOpacity>
            </View>

            <View style={styles.halfGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowPriorityModal(true)}
              >
                <Text style={styles.pickerText}>{formData.priority}</Text>
                <ChevronDown size={16} color={Colors.slate[400]} />
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

        {/* My Complaints List */}
        <View style={styles.listCard}>
          <Text style={styles.cardTitle}>My Complaints ({complaints.length})</Text>
          
          {complaints.map((complaint) => (
            <View key={complaint.id} style={styles.complaintItem}>
              <View style={styles.complaintHeader}>
                <View style={styles.complaintLeft}>
                  <Text style={styles.complaintSubject}>{complaint.subject}</Text>
                  <Text style={styles.complaintMeta}>
                    {complaint.id} • {complaint.category} • {formatDate(complaint.date)}
                  </Text>
                </View>
                <View style={styles.complaintRight}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(complaint.priority) + "22" }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: getPriorityColor(complaint.priority) }
                    ]}>
                      {complaint.priority}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(complaint.status) + "22" }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(complaint.status) }
                    ]}>
                      {complaint.status === "pending" ? "Pending" : "Resolved"}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.complaintDescription}>
                <Text style={styles.descriptionText}>{complaint.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* HR Hotline Button */}
        <TouchableOpacity 
          style={styles.hotlineButton}
          onPress={handleHotlineCall}
        >
          <Phone size={20} color={Colors.slate[200]} />
          <Text style={styles.hotlineButtonText}>HR Hotline: +880 1711-234567</Text>
        </TouchableOpacity>

        {/* Suggestion Box Button */}
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setShowSuggestionModal(true)}
        >
          <Text style={styles.suggestionButtonText}>Suggestion Box</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectionList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.selectionItem,
                    formData.category === category && styles.selectionItemActive
                  ]}
                  onPress={() => selectCategory(category)}
                >
                  <Text style={[
                    styles.selectionItemText,
                    formData.category === category && styles.selectionItemTextActive
                  ]}>
                    {category}
                  </Text>
                  {formData.category === category && (
                    <Text style={styles.selectionItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Priority Selection Modal */}
      <Modal
        visible={showPriorityModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Priority</Text>
              <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectionList}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.selectionItem,
                    formData.priority === priority && styles.selectionItemActive
                  ]}
                  onPress={() => selectPriority(priority)}
                >
                  <Text style={[
                    styles.selectionItemText,
                    formData.priority === priority && styles.selectionItemTextActive
                  ]}>
                    {priority}
                  </Text>
                  {formData.priority === priority && (
                    <Text style={styles.selectionItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Suggestion Modal */}
      <Modal
        visible={showSuggestionModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suggestion Box</Text>
              <TouchableOpacity onPress={() => setShowSuggestionModal(false)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.suggestionForm}>
                <Text style={styles.suggestionLabel}>New Suggestion</Text>
                <TextInput
                  style={[styles.input, styles.suggestionTextArea]}
                  value={suggestionText}
                  onChangeText={setSuggestionText}
                  placeholder="Share your ideas for improvement..."
                  placeholderTextColor={Colors.slate[500]}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                
                <TouchableOpacity 
                  style={styles.submitSuggestionButton}
                  onPress={submitSuggestion}
                >
                  <Text style={styles.submitSuggestionButtonText}>Submit Suggestion</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recentSuggestions}>
                <Text style={styles.recentSuggestionsTitle}>Recent Suggestions</Text>
                
                {suggestions.map((suggestion) => (
                  <View key={suggestion.id} style={styles.suggestionItem}>
                    <View style={styles.suggestionHeader}>
                      <Text style={styles.suggestionDate}>{formatDate(suggestion.date)}</Text>
                      <View style={[
                        styles.suggestionStatusBadge,
                        { backgroundColor: suggestion.status === "Reviewed" ? Colors.status.success + "22" : Colors.slate[400] + "22" }
                      ]}>
                        <Text style={[
                          styles.suggestionStatusText,
                          { color: suggestion.status === "Reviewed" ? Colors.status.success : Colors.slate[400] }
                        ]}>
                          {suggestion.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    color: Colors.slate[200],
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
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
    marginBottom: 20,
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
  input: {
    backgroundColor: Colors.neutral[800],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.slate[200],
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
  suggestionButton: {
    backgroundColor: Colors.brand.light,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  suggestionButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "600",
  },
  hotlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.neutral[800],
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    marginBottom: 12,
  },
  hotlineButtonText: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "500",
  },
  selectionModalContent: {
    backgroundColor: Colors.neutral[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
  },
  selectionList: {
    padding: 20,
  },
  selectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.neutral[800],
  },
  selectionItemActive: {
    backgroundColor: Colors.brand.light + "22",
    borderWidth: 1,
    borderColor: Colors.brand.light,
  },
  selectionItemText: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "500",
  },
  selectionItemTextActive: {
    color: Colors.brand.light,
    fontWeight: "600",
  },
  selectionItemCheck: {
    color: Colors.brand.light,
    fontSize: 18,
    fontWeight: "bold",
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  complaintItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.neutral[800] + "33",
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  complaintLeft: {
    flex: 1,
    paddingRight: 12,
  },
  complaintSubject: {
    color: Colors.slate[100],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  complaintMeta: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  complaintRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  complaintDescription: {
    backgroundColor: Colors.neutral[800] + "66",
    padding: 12,
    borderRadius: 8,
  },
  descriptionText: {
    color: Colors.slate[300],
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.neutral[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
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
  modalBody: {
    padding: 20,
  },
  suggestionForm: {
    marginBottom: 24,
  },
  suggestionLabel: {
    color: Colors.slate[300],
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  suggestionTextArea: {
    height: 120,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  submitSuggestionButton: {
    backgroundColor: Colors.brand.light,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitSuggestionButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "600",
  },
  recentSuggestions: {
    gap: 12,
  },
  recentSuggestionsTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  suggestionItem: {
    backgroundColor: Colors.neutral[800],
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  suggestionDate: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  suggestionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  suggestionText: {
    color: Colors.slate[200],
    fontSize: 14,
    lineHeight: 20,
  },
});
