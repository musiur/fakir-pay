import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Download, ExternalLink, FileText, PenTool, Plus, Send, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/Colors";
import { EMPLOYEES, KB_DOCS } from "../../constants/Data";
import { ChatMessage, KBDocument } from "../../types";

const SUGGESTIONS = [
  "Start a new signing request",
  "What is my leave balance?",
  "Find Fire Drill Procedure",
  "Download payslip",
  "How to apply maternity leave?",
  "Clock in not working",
  "Where is NDA template?",
  "Show holiday calendar",
];

export default function AIScreen() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [suggIndex, setSuggIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      text: "Ask how-to questions. Citations from SOPs will appear.",
    },
  ]);
  const [employee, setEmployee] = useState(EMPLOYEES[0]);
  const [showSOPModal, setShowSOPModal] = useState(false);
  const [selectedSOP, setSelectedSOP] = useState<KBDocument | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  const startNewChat = () => {
    setMessages([
      {
        role: "system",
        text: "Ask how-to questions. Citations from SOPs will appear.",
      },
    ]);
    setInput("");
  };

  useEffect(() => {
    if (input) return;
    const interval = setInterval(() => {
      setSuggIndex((i) => (i + 1) % SUGGESTIONS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [input]);

  const executeAgenticAction = (action: string, params?: any) => {
    switch (action) {
      case "download_payslip":
        Alert.alert(
          "Downloading Payslip",
          "Opening Payroll section to download your latest payslip...",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Payroll", 
              onPress: () => router.push("/payroll")
            }
          ]
        );
        break;
      
      case "view_sop":
        const sopDoc = KB_DOCS.find(doc => 
          doc.title.toLowerCase().includes(params?.title?.toLowerCase() || "") ||
          doc.id === params?.docId
        );
        if (sopDoc) {
          setSelectedSOP(sopDoc);
          setShowSOPModal(true);
        } else {
          Alert.alert(
            "Opening SOP",
            `Opening ${params?.title || "document"} in Knowledge Base...`,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Open KB", 
                onPress: () => router.push("/(tabs)/kb")
              }
            ]
          );
        }
        break;
      
      case "start_esign":
        Alert.alert(
          "Starting E-Sign Request",
          "Opening E-Sign to create a new signing request...",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open E-Sign", 
              onPress: () => router.push("/(tabs)/esign")
            }
          ]
        );
        break;
      
      case "apply_leave":
        Alert.alert(
          "Apply for Leave",
          "Opening Leave application form...",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Leave", 
              onPress: () => router.push("/leave")
            }
          ]
        );
        break;
      
      default:
        Alert.alert("Demo Action", `This would execute: ${action}`);
    }
  };

  const answerFor = (q: string) => {
    const ql = q.toLowerCase();
    const b = employee.leaveBalance;

    if (ql.includes("leave balance")) {
      return {
        text: `Annual: ${b.annual} days, Sick: ${b.sick} days, Casual: ${b.casual} days.`,
        source: "Leave Policy",
        actions: [
          { type: "apply_leave", label: "Apply for Leave", icon: "calendar" }
        ]
      };
    }

    if (ql.includes("payslip") || ql.includes("download")) {
      return { 
        text: "I can help you download your latest payslip. Your current net salary is ৳47,800.",
        actions: [
          { type: "download_payslip", label: "Download Payslip", icon: "download" }
        ]
      };
    }

    if (ql.includes("clock in") || ql.includes("geofence")) {
      return {
        text: "Clock-in is allowed only inside the factory geofence. Go to Attendance to toggle the demo geofence switch.",
      };
    }

    if (ql.includes("start") && ql.includes("sign")) {
      return {
        text: "I'll help you start a new signing request. You can create document workflows for approvals.",
        actions: [
          { type: "start_esign", label: "Start E-Sign Request", icon: "pen" }
        ]
      };
    }

    if (ql.includes("fire drill") || ql.includes("fire") || ql.includes("procedure")) {
      const doc = KB_DOCS.find(d => d.title.toLowerCase().includes("fire")) || KB_DOCS[0];
      return {
        text: `According to Fire Drill Procedure v3.2: In case of fire alarm, evacuate immediately via nearest exit. Assembly point is the main parking area.`,
        cite: { docId: doc.id, heading: "Emergency Evacuation" },
        actions: [
          { type: "view_sop", label: "View Full SOP", icon: "external", params: { title: "Fire Drill Procedure" } }
        ]
      };
    }

    if (ql.includes("nda") || ql.includes("template")) {
      return {
        text: "NDA template is available in Knowledge Base under Legal Documents section. It includes standard confidentiality clauses.",
        actions: [
          { type: "view_sop", label: "View NDA Template", icon: "external", params: { title: "NDA Template" } }
        ]
      };
    }

    if (ql.includes("holiday") || ql.includes("calendar")) {
      return {
        text: "The 2025 holiday calendar shows Victory Day on Dec 16, Christmas on Dec 25. Total 12 public holidays this year.",
        actions: [
          { type: "view_sop", label: "View Holiday Calendar", icon: "external", params: { title: "Holiday Calendar 2025" } }
        ]
      };
    }

    if (ql.includes("maternity") || ql.includes("leave policy")) {
      return {
        text: "Maternity leave: 16 weeks (6 weeks before + 10 weeks after delivery). Submit medical certificate 8 weeks before due date.",
        source: "HR Policy Manual",
        actions: [
          { type: "view_sop", label: "View Leave Policy", icon: "external", params: { title: "Leave Policy" } },
          { type: "apply_leave", label: "Apply for Leave", icon: "calendar" }
        ]
      };
    }

    return { text: "I've noted your query. For complex requests, I'll route this to the appropriate department." };
  };

  const send = () => {
    const q = input.trim();
    if (!q) return;

    const userMsg: ChatMessage = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const ans = answerFor(q);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        text: ans.text,
        cite: ans.cite,
        source: ans.source,
        actions: ans.actions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 300);
  };

  const handleActionPress = (action: any) => {
    executeAgenticAction(action.type, action.params);
  };

  const getActionIcon = (iconType: string) => {
    switch (iconType) {
      case "download": return Download;
      case "external": return ExternalLink;
      case "pen": return PenTool;
      case "calendar": return FileText;
      default: return ExternalLink;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>ask FFL — AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              Brief answers • SOP citations • Agentic workflows
            </Text>
          </View>
          <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
            <Plus size={20} color={Colors.brand.light} />
            <Text style={styles.newChatText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {messages.length === 1 && messages[0].role === "system" && (
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeText}>Try a quick prompt:</Text>
          <View style={styles.suggestionsGrid}>
            {SUGGESTIONS.slice(0, 4).map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => setInput(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(
          (msg, i) =>
            msg.role !== "system" && (
              <View
                key={i}
                style={[
                  styles.message,
                  msg.role === "user"
                    ? styles.messageUser
                    : styles.messageAssistant,
                ]}
              >
                <Text
                  style={
                    msg.role === "user"
                      ? styles.messageTextUser
                      : styles.messageTextAssistant
                  }
                >
                  {msg.text}
                </Text>
                {msg.source && (
                  <View style={styles.source}>
                    <Text style={styles.sourceLabel}>Source: </Text>
                    <Text style={styles.sourceText}>{msg.source}</Text>
                    <TouchableOpacity onPress={() => executeAgenticAction("view_sop", { title: msg.source })}>
                      <Text style={styles.sourceLink}>View SOP →</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {msg.cite && (
                  <View style={styles.citation}>
                    <Text style={styles.citationLabel}>Source:</Text>
                    <Text style={styles.citationText}>{msg.cite.heading}</Text>
                    <TouchableOpacity onPress={() => executeAgenticAction("view_sop", { docId: msg.cite?.docId, title: msg.cite?.heading })}>
                      <Text style={styles.citationLink}>View SOP →</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {msg.actions && msg.actions.length > 0 && (
                  <View style={styles.actionsContainer}>
                    {msg.actions.map((action, actionIndex) => {
                      const IconComponent = getActionIcon(action.icon);
                      return (
                        <TouchableOpacity
                          key={actionIndex}
                          style={styles.actionButton}
                          onPress={() => handleActionPress(action)}
                        >
                          <IconComponent size={14} color={Colors.brand.light} />
                          <Text style={styles.actionText}>{action.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={input ? "Type a message…" : SUGGESTIONS[suggIndex]}
          placeholderTextColor={Colors.slate[500]}
          multiline
          returnKeyType="send"
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendButton} onPress={send}>
          <Send size={20} color={Colors.neutral[900]} />
        </TouchableOpacity>
      </View>

      {/* SOP Modal */}
      <Modal
        visible={showSOPModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.sopModalContainer}>
          <View style={styles.sopModalHeader}>
            <View style={styles.sopModalHeaderLeft}>
              <Text style={styles.sopModalTitle}>{selectedSOP?.title}</Text>
              <Text style={styles.sopModalSubtitle}>
                {selectedSOP?.category} • Last updated {selectedSOP?.lastUpdated}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowSOPModal(false)}>
              <X size={24} color={Colors.slate[300]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sopModalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.sopExcerpt}>
              <Text style={styles.sopExcerptTitle}>Overview</Text>
              <Text style={styles.sopExcerptText}>{selectedSOP?.excerpt}</Text>
            </View>

            {selectedSOP?.chunks && selectedSOP.chunks.length > 0 && (
              <View style={styles.sopSections}>
                <Text style={styles.sopSectionsTitle}>Document Sections</Text>
                {selectedSOP.chunks.map((chunk: any, index: number) => (
                  <View key={chunk.id} style={styles.sopSection}>
                    <Text style={styles.sopSectionHeading}>
                      {index + 1}. {chunk.heading}
                    </Text>
                    <Text style={styles.sopSectionText}>{chunk.text}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.sopFooter}>
              <Text style={styles.sopFooterText}>
                For the complete document, visit the Knowledge Base section.
              </Text>
              <TouchableOpacity 
                style={styles.sopKBButton}
                onPress={() => {
                  setShowSOPModal(false);
                  router.push("/(tabs)/kb");
                }}
              >
                <FileText size={16} color={Colors.brand.light} />
                <Text style={styles.sopKBButtonText}>Open in Knowledge Base</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.slate[200],
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  newChatText: {
    color: Colors.brand.light,
    fontSize: 12,
    fontWeight: "500",
  },
  welcome: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "66",
  },
  welcomeTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  welcomeText: {
    color: Colors.slate[400],
    fontSize: 13,
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: Colors.neutral[800],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  suggestionText: {
    color: Colors.slate[300],
    fontSize: 12,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  message: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  messageUser: {
    alignSelf: "flex-end",
    backgroundColor: Colors.brand.light,
  },
  messageAssistant: {
    alignSelf: "flex-start",
    backgroundColor: Colors.neutral[800],
  },
  messageTextUser: {
    color: Colors.neutral[900],
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextAssistant: {
    color: Colors.slate[100],
    fontSize: 14,
    lineHeight: 20,
  },
  citation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  citationLabel: {
    color: Colors.slate[400],
    fontSize: 10,
  },
  citationText: {
    color: Colors.slate[300],
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  citationLink: {
    color: Colors.brand.light,
    fontSize: 11,
    fontWeight: "500",
  },
  source: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceLabel: {
    color: Colors.slate[400],
    fontSize: 10,
  },
  sourceText: {
    color: Colors.slate[300],
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  sourceLink: {
    color: Colors.brand.light,
    fontSize: 11,
    fontWeight: "500",
  },
  actionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  actionText: {
    color: Colors.brand.light,
    fontSize: 12,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
  },
  input: {
    flex: 1,
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.slate[200],
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  // SOP Modal Styles
  sopModalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
  },
  sopModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
  },
  sopModalHeaderLeft: {
    flex: 1,
    paddingRight: 16,
  },
  sopModalTitle: {
    color: Colors.slate[200],
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sopModalSubtitle: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  sopModalContent: {
    flex: 1,
    padding: 20,
  },
  sopExcerpt: {
    backgroundColor: Colors.neutral[900] + "66",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sopExcerptTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sopExcerptText: {
    color: Colors.slate[300],
    fontSize: 14,
    lineHeight: 20,
  },
  sopSections: {
    marginBottom: 20,
  },
  sopSectionsTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sopSection: {
    backgroundColor: Colors.neutral[900] + "33",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand.light,
  },
  sopSectionHeading: {
    color: Colors.slate[100],
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  sopSectionText: {
    color: Colors.slate[300],
    fontSize: 14,
    lineHeight: 20,
  },
  sopFooter: {
    backgroundColor: Colors.neutral[800] + "66",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  sopFooterText: {
    color: Colors.slate[400],
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  sopKBButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  sopKBButtonText: {
    color: Colors.brand.light,
    fontSize: 14,
    fontWeight: "500",
  },
});
