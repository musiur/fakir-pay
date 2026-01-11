import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { Fingerprint, KeyRound, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
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
import { Colors } from "../../constants/Colors";
import { EMPLOYEES } from "../../constants/Data";

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"id" | "2fa" | "bio">("id");
  const [empId, setEmpId] = useState("FFL-1001");
  const [pwd, setPwd] = useState("");
  const [otp, setOtp] = useState("");

  const currentEmployee = EMPLOYEES.find((e) => e.id === empId) || EMPLOYEES[0];

  const start2FA = () => {
    if (!pwd) {
      Alert.alert("Required", "Enter password (demo accepts anything)");
      return;
    }
    setStep("2fa");
  };

  const complete2FA = () => {
    if (otp.length < 4) {
      Alert.alert("Required", "Enter 4+ digit OTP (demo accepts anything)");
      return;
    }
    setStep("bio");
  };

  const handleBiometricAuth = async () => {
    try {
      // Check if device supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();

      if (!compatible) {
        // Fallback: If no biometrics, allow login anyway (for demo)
        Alert.alert(
          "Biometric Not Available",
          "Biometric authentication is not available on this device. Logging in without biometric verification.",
          [{ text: "OK", onPress: completeBio }]
        );
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!enrolled) {
        // No biometrics enrolled
        Alert.alert(
          "No Biometrics Enrolled",
          "Please set up biometric authentication in your device settings. Logging in without biometric verification for now.",
          [{ text: "OK", onPress: completeBio }]
        );
        return;
      }

      // Trigger biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to login to Fakir Pay",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        // Biometric authentication successful
        completeBio();
      } else {
        // Authentication failed or cancelled
        if (result.error === "user_cancel") {
          Alert.alert("Cancelled", "Biometric authentication was cancelled.");
        } else if (result.error === "lockout") {
          Alert.alert(
            "Locked Out",
            "Too many failed attempts. Please try again later."
          );
        } else {
          Alert.alert(
            "Authentication Failed",
            "Biometric authentication failed. Please try again."
          );
        }
      }
    } catch (error) {
      console.log("Biometric auth error:", error);
      Alert.alert(
        "Error",
        "An error occurred during biometric authentication. Proceeding without verification."
      );
      completeBio();
    }
  };

  const completeBio = async () => {
    await AsyncStorage.setItem("employeeId", empId);
    router.replace("/(tabs)");
  };

  const switchEmployee = () => {
    const currentIndex = EMPLOYEES.findIndex((e) => e.id === empId);
    const nextIndex = (currentIndex + 1) % EMPLOYEES.length;
    setEmpId(EMPLOYEES[nextIndex].id);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Fingerprint size={28} color={Colors.brand.light} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Fakir Pay</Text>
            <Text style={styles.subtitle}>FFL Employee Portal</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={20} color={Colors.brand.light} />
            <Text style={styles.cardHeaderText}>
              Secure Login • 2FA • Biometrics
            </Text>
          </View>

          <View style={styles.cardContent}>
            {step === "id" && (
              <>
                <Text style={styles.label}>Employee ID</Text>
                <TouchableOpacity
                  onPress={switchEmployee}
                  style={styles.selectContainer}
                >
                  <Text style={styles.selectValue}>
                    {empId} — {currentEmployee.name}
                  </Text>
                  <Text style={styles.selectHint}>Tap to switch employee</Text>
                </TouchableOpacity>

                <Text style={[styles.label, styles.labelSpaced]}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={pwd}
                  onChangeText={setPwd}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.slate[500]}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={start2FA}
                />

                <TouchableOpacity style={styles.button} onPress={start2FA}>
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}

            {step === "2fa" && (
              <>
                <View style={styles.stepHeader}>
                  <KeyRound size={20} color={Colors.slate[200]} />
                  <Text style={styles.stepTitle}>2-Step Verification</Text>
                </View>
                <Text style={styles.stepDescription}>
                  We sent a one-time code to SMS & email.
                </Text>

                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                  placeholderTextColor={Colors.slate[500]}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={complete2FA}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => setStep("id")}
                  >
                    <Text style={styles.buttonSecondaryText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonFlex]}
                    onPress={complete2FA}
                  >
                    <Text style={styles.buttonText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === "bio" && (
              <>
                <View style={styles.stepHeader}>
                  <Fingerprint size={20} color={Colors.slate[200]} />
                  <Text style={styles.stepTitle}>Biometric Check</Text>
                </View>
                <Text style={styles.stepDescription}>
                  Touch the fingerprint sensor to continue.
                </Text>

                <TouchableOpacity
                  style={styles.bioButton}
                  onPress={handleBiometricAuth}
                >
                  <Fingerprint size={50} color="#10b981" />
                  <Text style={styles.bioButtonText}>Tap to verify</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
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
    padding: 24,
    paddingTop: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.slate[400],
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    overflow: "hidden",
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.neutral[900] + "CC",
  },
  cardHeaderText: {
    color: Colors.slate[200],
    fontSize: 14,
  },
  cardContent: {
    padding: 20,
    backgroundColor: Colors.neutral[900] + "66",
  },
  label: {
    color: Colors.slate[400],
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500",
  },
  labelSpaced: {
    marginTop: 20,
  },
  selectContainer: {
    backgroundColor: Colors.neutral[900],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    padding: 16,
  },
  selectValue: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "500",
  },
  selectHint: {
    color: Colors.slate[500],
    fontSize: 11,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 14,
    padding: 16,
    color: Colors.slate[200],
    fontSize: 15,
  },
  button: {
    backgroundColor: Colors.brand.light,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonText: {
    color: Colors.neutral[900],
    fontSize: 15,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: "transparent",
  },
  buttonSecondaryText: {
    color: Colors.slate[200],
    fontSize: 15,
    fontWeight: "500",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  stepTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
  },
  stepDescription: {
    color: Colors.slate[400],
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 20,
  },
  bioButton: {
    marginTop: 12,
    padding: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.status.success,
    backgroundColor: Colors.status.success + "1A",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  bioEmoji: {
    fontSize: 60,
  },
  bioButtonText: {
    color: Colors.slate[200],
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  bioHint: {
    color: Colors.slate[500],
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
