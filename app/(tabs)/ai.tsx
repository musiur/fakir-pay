import AsyncStorage from "@react-native-async-storage/async-storage";
import { Send } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { EMPLOYEES, KB_DOCS } from "../../constants/Data";
import { ChatMessage } from "../../types";

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
  const [input, setInput] = useState("");
  const [suggIndex, setSuggIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      text: "Ask how-to questions. Citations from SOPs will appear.",
    },
  ]);
  const [employee, setEmployee] = useState(EMPLOYEES[0]);

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  useEffect(() => {
    if (input) return;
    const interval = setInterval(() => {
      setSuggIndex((i) => (i + 1) % SUGGESTIONS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [input]);

  const answerFor = (q: string) => {
    const ql = q.toLowerCase();
    const b = employee.leaveBalance;

    if (ql.includes("leave balance")) {
      return {
        text: `Your current leave balance — Annual: ${b.annual}, Sick: ${b.sick}, Casual: ${b.casual}.`,
      };
    }

    if (ql.includes("payslip") || ql.includes("download")) {
      return { text: "Opening Payroll → Payslips section..." };
    }

    if (ql.includes("clock in") || ql.includes("geofence")) {
      return {
        text: "Clock-in is allowed only inside the factory geofence. Go to Attendance to toggle the demo geofence switch.",
      };
    }

    if (ql.includes("start") && ql.includes("sign")) {
      return {
        text: "Opening E-Sign to start a new request (demo simulation).",
      };
    }

    if (
      KB_DOCS.length &&
      (ql.includes("fire") || ql.includes("nda") || ql.includes("policy"))
    ) {
      const doc =
        KB_DOCS.find(
          (d) =>
            d.title.toLowerCase().includes(ql) ||
            d.excerpt.toLowerCase().includes(ql)
        ) || KB_DOCS[0];

      const chunk = doc.chunks?.[0];
      return {
        text: `According to ${doc.title}: ${chunk?.text || doc.excerpt}`,
        cite: chunk ? { docId: doc.id, heading: chunk.heading } : undefined,
      };
    }

    return { text: "Noted. I will route this to HR policy (demo simulation)." };
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
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ask FFL — AI Assistant</Text>
        <Text style={styles.headerSubtitle}>
          English & Bangla • SOP citations • Start e-sign
        </Text>
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
                {msg.cite && (
                  <View style={styles.citation}>
                    <Text style={styles.citationLabel}>Cited:</Text>
                    <Text style={styles.citationText}>{msg.cite.heading}</Text>
                    <Text style={styles.citationLink}>View SOP</Text>
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
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.sendButton} onPress={send}>
          <Send size={20} color={Colors.neutral[900]} />
        </TouchableOpacity>
      </View>
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
});
