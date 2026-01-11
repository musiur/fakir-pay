import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fingerprint, Plus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusPill } from "../../components/StatusPill";
import { Colors } from "../../constants/Colors";
import { EMPLOYEES, ESIGN_DOCS } from "../../constants/Data";
import { ESignDocument, Employee } from "../../types";

export default function ESignScreen() {
  const [view, setView] = useState<"inbox" | "sent" | "completed" | "all">(
    "inbox"
  );
  const [docs, setDocs] = useState<ESignDocument[]>(ESIGN_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<ESignDocument | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  const filtered = docs.filter((d) => {
    if (view === "inbox")
      return d.signers.some(
        (s) => s.id === employee.id && s.status === "pending"
      );
    if (view === "sent") return d.owner === employee.id;
    if (view === "completed")
      return d.signers.every((s) => s.status === "signed");
    return true;
  });

  const canSign = (d: ESignDocument) => {
    if (!d) {
      return {
        ok: false,
      };
    }

    const idx = d.signers.findIndex((s) => s.id === employee.id);
    if (idx < 0) return { ok: false, reason: "Not a participant" };
    const me = d.signers[idx];
    if (me.status !== "pending")
      return {
        ok: false,
        reason: me.status === "signed" ? "Already signed" : "Not pending",
      };
    if (
      d.route === "Sequential" &&
      !d.signers.slice(0, idx).every((x) => x.status === "signed")
    ) {
      return { ok: false, reason: `Waiting for previous signer` };
    }
    return { ok: true };
  };

  const handleSign = (doc: ESignDocument) => {
    const check = canSign(doc);
    if (!check.ok) {
      Alert.alert("Cannot Sign", check.reason);
      return;
    }
    setSelectedDoc(doc);
    setShowBiometric(true);
  };

  const completeBiometric = () => {
    if (!selectedDoc) return;

    setDocs((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDoc.id) return d;
        const signers = d.signers.map((s) =>
          s.id === employee.id
            ? {
                ...s,
                status: "signed" as const,
                signedAt: new Date().toISOString(),
              }
            : s
        );
        const completedNow = signers.every((s) => s.status === "signed");
        return {
          ...d,
          signers,
          completedAt: completedNow ? new Date().toISOString() : undefined,
        };
      })
    );

    setShowBiometric(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedDoc(null);
    }, 2000);
  };

  const getPriorityStyle = (emergency: string) => {
    switch (emergency) {
      case "Critical":
        return { bg: Colors.status.error + "1A", border: Colors.status.error };
      case "High":
        return {
          bg: Colors.status.success + "1A",
          border: Colors.status.success,
        };
      default:
        return { bg: Colors.neutral[800] + "33", border: Colors.neutral[700] };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              view === "inbox" && styles.filterButtonActive,
            ]}
            onPress={() => setView("inbox")}
          >
            <Text
              style={[
                styles.filterText,
                view === "inbox" && styles.filterTextActive,
              ]}
            >
              To Sign
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              view === "sent" && styles.filterButtonActive,
            ]}
            onPress={() => setView("sent")}
          >
            <Text
              style={[
                styles.filterText,
                view === "sent" && styles.filterTextActive,
              ]}
            >
              Sent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              view === "completed" && styles.filterButtonActive,
            ]}
            onPress={() => setView("completed")}
          >
            <Text
              style={[
                styles.filterText,
                view === "completed" && styles.filterTextActive,
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.newButton}>
          <Plus size={20} color={Colors.neutral[900]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No documents found</Text>
        )}
        {filtered.map((doc) => {
          const priority = getPriorityStyle(doc.emergency);
          return (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.docCard,
                { backgroundColor: priority.bg, borderColor: priority.border },
              ]}
              onPress={() => setSelectedDoc(doc)}
            >
              <View style={styles.docContent}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docMeta}>
                  {doc.dept} • {doc.emergency} • Due{" "}
                  {new Date(doc.deadline).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={styles.docStatus}>
                {doc.signers.every((s) => s.status === "signed") ? (
                  <StatusPill status="completed" />
                ) : (
                  <StatusPill
                    status={
                      doc.emergency === "Critical" ? "overdue" : "pending"
                    }
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Document Detail Modal */}
      <Modal
        visible={!!selectedDoc && !showBiometric && !showSuccess}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>{selectedDoc?.title}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedDoc?.dept} • {selectedDoc?.emergency} •{" "}
                  {selectedDoc?.route}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDoc(null)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Signing Order</Text>
              {selectedDoc?.signers.map((signer, i) => {
                const isActive =
                  signer.status === "pending" &&
                  (selectedDoc.route === "Parallel" ||
                    selectedDoc.signers
                      .slice(0, i)
                      .every((x) => x.status === "signed"));
                return (
                  <View
                    key={signer.id}
                    style={[
                      styles.signerCard,
                      isActive && styles.signerCardActive,
                    ]}
                  >
                    <View style={styles.signerInfo}>
                      <Text style={styles.signerName}>
                        {i + 1}. {signer.name}
                      </Text>
                      <Text style={styles.signerDesignation}>
                        {signer.designation}
                      </Text>
                    </View>
                    <StatusPill status={signer.status} />
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              {selectedDoc && canSign(selectedDoc).ok ? (
                <TouchableOpacity
                  style={styles.signButton}
                  onPress={() => handleSign(selectedDoc)}
                >
                  <Text style={styles.signButtonText}>Sign Document</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.disabledButton}>
                  <Text style={styles.disabledButtonText}>
                    {canSign(selectedDoc!)?.reason}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Biometric Modal */}
      <Modal visible={showBiometric} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.biometricModal}>
            <View style={styles.biometricIcon}>
              <Fingerprint size={50} color={Colors.status.info} />
            </View>
            <Text style={styles.biometricTitle}>Biometric Verification</Text>
            <Text style={styles.biometricText}>
              Place your finger on the sensor to sign
            </Text>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={completeBiometric}
            >
              <Fingerprint size={60} color={Colors.status.info} />
              <Text style={styles.biometricButtonText}>Touch to Sign</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowBiometric(false);
                setSelectedDoc(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Document Signed!</Text>
            <Text style={styles.successText}>
              Your digital signature has been applied
            </Text>
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
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
  },
  filterContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  filterButtonActive: {
    backgroundColor: Colors.brand.light + "22",
    borderColor: Colors.brand.light,
  },
  filterText: {
    color: Colors.slate[300],
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: Colors.brand.light,
  },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyText: {
    color: Colors.slate[400],
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  docCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 12,
  },
  docContent: {
    flex: 1,
  },
  docTitle: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  docMeta: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  docStatus: {
    justifyContent: "center",
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
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    color: Colors.slate[400],
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  signerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    marginBottom: 8,
  },
  signerCardActive: {
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  signerInfo: {
    flex: 1,
  },
  signerName: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  signerDesignation: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[800],
  },
  signButton: {
    backgroundColor: Colors.brand.light,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  signButtonText: {
    color: Colors.neutral[900],
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: Colors.neutral[800],
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  disabledButtonText: {
    color: Colors.slate[400],
    fontSize: 15,
    fontWeight: "500",
  },
  biometricModal: {
    backgroundColor: Colors.neutral[900],
    margin: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
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
    color: Colors.slate[200],
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  biometricText: {
    color: Colors.slate[400],
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
  },
  biometricButton: {
    width: "100%",
    padding: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.status.info,
    backgroundColor: Colors.status.info + "1A",
    alignItems: "center",
    gap: 12,
  },
  biometricButtonText: {
    color: Colors.status.info,
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.slate[300],
    fontSize: 14,
  },
  successModal: {
    backgroundColor: Colors.neutral[900],
    margin: 20,
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.status.success + "33",
    borderWidth: 2,
    borderColor: Colors.status.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successCheckmark: {
    fontSize: 36,
    color: Colors.status.success,
  },
  successTitle: {
    color: Colors.slate[100],
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  successText: {
    color: Colors.slate[400],
    fontSize: 13,
    textAlign: "center",
  },
});
