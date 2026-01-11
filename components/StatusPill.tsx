import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";

interface StatusPillProps {
  status: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case "signed":
      case "approved":
      case "present":
      case "completed":
        return { bg: Colors.status.successBg, text: Colors.status.successText };
      case "rejected":
      case "absent":
      case "overdue":
        return { bg: Colors.status.errorBg, text: Colors.status.errorText };
      case "pending":
      case "critical":
        return { bg: Colors.status.warningBg, text: Colors.status.warningText };
      default:
        return { bg: Colors.slate[200], text: Colors.neutral[900] };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
