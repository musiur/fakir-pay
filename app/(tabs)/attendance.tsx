import { Fingerprint, MapPin } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusPill } from "../../components/StatusPill";
import { Colors } from "../../constants/Colors";
import { ATTENDANCE_HISTORY } from "../../constants/Data";
import { AttendanceRecord } from "../../types";

export default function AttendanceScreen() {
  const [step, setStep] = useState<"zone" | "biometric" | "success">("zone");
  const [geofenceOk, setGeofenceOk] = useState(true);
  const [clocked, setClocked] = useState(false);
  const [history, setHistory] =
    useState<AttendanceRecord[]>(ATTENDANCE_HISTORY);

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

          {!geofenceOk && (
            <View style={styles.demoControls}>
              <Text style={styles.demoLabel}>
                Demo Mode - Toggle Zone Status:
              </Text>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => setGeofenceOk(true)}
              >
                <Text style={styles.demoButtonText}>Simulate Inside Zone</Text>
              </TouchableOpacity>
            </View>
          )}

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
            Place your finger on the sensor to{" "}
            {clocked ? "clock out" : "clock in"}
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

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Attendance History</Text>
        <View style={styles.historyList}>
          {history.map((record, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyDate}>{record.date}</Text>
                <Text style={styles.historyTime}>
                  In {record.clockIn} • Out {record.clockOut}
                </Text>
              </View>
              <StatusPill status={record.status.toLowerCase()} />
            </View>
          ))}
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
  demoControls: {
    width: "100%",
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.neutral[800] + "66",
    borderRadius: 12,
  },
  demoLabel: {
    color: Colors.slate[400],
    fontSize: 12,
    marginBottom: 12,
    textAlign: "center",
  },
  demoButton: {
    backgroundColor: Colors.status.success,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  demoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  historyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    overflow: "hidden",
  },
  historyTitle: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  historyList: {
    padding: 4,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  historyItemLeft: {
    flex: 1,
  },
  historyDate: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  historyTime: {
    color: Colors.slate[400],
    fontSize: 12,
  },
});
