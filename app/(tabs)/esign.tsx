import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fingerprint, Plus, Upload, User, Users, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import { Colors } from "../../constants/Colors";
import { EMPLOYEES, ESIGN_DOCS } from "../../constants/Data";
import { ESignDocument, Employee } from "../../types";

type TabType = "To Sign" | "Sent" | "Done" | "History";

export default function ESignScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("To Sign");
  const [docs, setDocs] = useState<ESignDocument[]>(ESIGN_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<ESignDocument | null>(null);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);
  const [selectedSigners, setSelectedSigners] = useState<Employee[]>([]);
  const [createForm, setCreateForm] = useState({
    documentName: "",
    department: "",
    deadline: "",
    priority: "Normal" as "Normal" | "High" | "Critical",
    signingOrder: "Sequential" as "Sequential" | "Parallel",
  });

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  const getFilteredDocs = () => {
    switch (activeTab) {
      case "To Sign":
        return docs.filter((d) =>
          d.signers.some(
            (s) => s.id === employee.id && s.status === "pending"
          )
        );
      case "Sent":
        return docs.filter((d) => d.owner === employee.id);
      case "Done":
        return docs.filter((d) =>
          d.signers.every((s) => s.status === "signed")
        );
      case "History":
        return docs.filter((d) =>
          d.signers.some(
            (s) => s.id === employee.id && s.status === "signed"
          )
        );
      default:
        return docs;
    }
  };

  const canSign = (d: ESignDocument) => {
    if (!d) return { ok: false, reason: "No document" };

    const idx = d.signers.findIndex((s) => s.id === employee.id);
    if (idx < 0) return { ok: false, reason: "Not a participant" };
    
    const me = d.signers[idx];
    if (me.status !== "pending") {
      return {
        ok: false,
        reason: me.status === "signed" ? "Already signed" : "Not pending",
      };
    }
    
    if (
      d.route === "Sequential" &&
      !d.signers.slice(0, idx).every((x) => x.status === "signed")
    ) {
      return { ok: false, reason: "Waiting for previous signer" };
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

  const handleCreateRequest = () => {
    if (!createForm.documentName || !createForm.department || !createForm.deadline || selectedSigners.length === 0) {
      Alert.alert("Required Fields", "Please fill in all required fields and select at least one signer");
      return;
    }

    // Generate new document ID
    const docNumber = (docs.length + 1).toString().padStart(3, '0');
    const newDocId = `ES-${docNumber}`;

    // Create new document
    const newDoc: ESignDocument = {
      id: newDocId,
      title: createForm.documentName,
      dept: createForm.department,
      emergency: createForm.priority,
      deadline: createForm.deadline,
      route: createForm.signingOrder,
      owner: employee.id,
      createdAt: new Date().toISOString(),
      hasDocument: documentUploaded,
      signers: selectedSigners.map(signer => ({
        id: signer.id,
        name: signer.name,
        designation: signer.designation,
        status: "pending" as const,
      })),
    };

    // Add to documents list
    setDocs(prevDocs => [newDoc, ...prevDocs]);

    // Reset form and close modal
    setCreateForm({
      documentName: "",
      department: "",
      deadline: "",
      priority: "Normal",
      signingOrder: "Sequential",
    });
    setSelectedSigners([]);
    setDocumentUploaded(false);
    setShowCreateModal(false);

    // Switch to Sent tab to show the new document
    setActiveTab("Sent");

    Alert.alert("Success", `Signing request created successfully with ID: ${newDocId}`);
  };

  const handleSelectSigners = () => {
    setShowSignerModal(true);
  };

  const toggleSigner = (signer: Employee) => {
    setSelectedSigners(prev => {
      const exists = prev.find(s => s.id === signer.id);
      if (exists) {
        return prev.filter(s => s.id !== signer.id);
      } else {
        return [...prev, signer];
      }
    });
  };

  const handleDocumentUpload = () => {
    setDocumentUploaded(!documentUploaded);
    Alert.alert(
      documentUploaded ? "Document Removed" : "Document Uploaded", 
      documentUploaded ? "Document has been removed" : "Document has been uploaded successfully"
    );
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

  const getPriorityColor = (emergency: string) => {
    switch (emergency) {
      case "Critical":
        return Colors.status.error;
      case "High":
        return "#f59e0b";
      case "Normal":
      default:
        return Colors.brand.light;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return Colors.status.success;
      case "Pending":
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

  const getDocumentStatus = (doc: ESignDocument) => {
    const allSigned = doc.signers.every((s) => s.status === "signed");
    if (allSigned) return "Completed";
    
    const userSigner = doc.signers.find((s) => s.id === employee.id);
    if (userSigner?.status === "signed") return "Signed";
    
    return "Pending";
  };

  const renderDocumentCard = (doc: ESignDocument) => {
    const status = getDocumentStatus(doc);
    const borderColor = getPriorityColor(doc.emergency);
    
    return (
      <TouchableOpacity
        key={doc.id}
        style={[styles.docCard, { borderLeftColor: borderColor }]}
        onPress={() => setSelectedDoc(doc)}
      >
        <View style={styles.docHeader}>
          <Text style={styles.docTitle}>{doc.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <Text style={styles.docMeta}>
          {doc.dept} • Due {formatDate(doc.deadline)}
        </Text>
        
        <View style={styles.docFooter}>
          <View style={styles.signerAvatars}>
            {doc.signers.slice(0, 2).map((signer, index) => (
              <View key={signer.id} style={[styles.avatar, { marginLeft: index * -8 }]}>
                <User size={16} color={Colors.slate[400]} />
              </View>
            ))}
            {doc.signers.length > 2 && (
              <View style={[styles.avatar, styles.moreAvatar, { marginLeft: -8 }]}>
                <Text style={styles.moreText}>+{doc.signers.length - 2}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filtered = getFilteredDocs();

  return (
    <View style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          {(["To Sign", "Sent", "Done", "History"] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]} numberOfLines={1}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color={Colors.brand.light} />
        </TouchableOpacity>
      </View>

      {/* Document List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No documents found</Text>
        ) : (
          filtered.map(renderDocumentCard)
        )}
      </ScrollView>

      {/* Create Signing Request Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>Create Signing Request</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.createForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Document Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.formInput}
                    value={createForm.documentName}
                    onChangeText={(text) => setCreateForm({...createForm, documentName: text})}
                    placeholder="Enter document title"
                    placeholderTextColor={Colors.slate[500]}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Issuing Department <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.formInput}
                    value={createForm.department}
                    onChangeText={(text) => setCreateForm({...createForm, department: text})}
                    placeholder="e.g., HR, Finance, Legal"
                    placeholderTextColor={Colors.slate[500]}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Issuing Person</Text>
                  <View style={styles.issuingPersonContainer}>
                    <Text style={styles.issuingPersonText}>{employee.name}</Text>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Sign By Date <Text style={styles.required}>*</Text></Text>
                  <DatePicker
                    value={createForm.deadline}
                    onDateChange={(date) => setCreateForm({...createForm, deadline: date})}
                    placeholder="Select Deadline"
                    minDate={new Date()}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Priority Level</Text>
                  <View style={styles.priorityButtons}>
                    {(["Normal", "High", "Critical"] as const).map((priority) => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.priorityButton,
                          createForm.priority === priority && styles.priorityButtonActive,
                          priority === "High" && createForm.priority === priority && styles.priorityButtonHigh,
                          priority === "Critical" && createForm.priority === priority && styles.priorityButtonCritical,
                        ]}
                        onPress={() => setCreateForm({...createForm, priority})}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          createForm.priority === priority && styles.priorityButtonTextActive,
                        ]}>
                          {priority}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Signing Order</Text>
                  <View style={styles.signingOrderButtons}>
                    {(["Sequential", "Parallel"] as const).map((order) => (
                      <TouchableOpacity
                        key={order}
                        style={[
                          styles.signingOrderButton,
                          createForm.signingOrder === order && styles.signingOrderButtonActive,
                        ]}
                        onPress={() => setCreateForm({...createForm, signingOrder: order})}
                      >
                        <Text style={[
                          styles.signingOrderButtonText,
                          createForm.signingOrder === order && styles.signingOrderButtonTextActive,
                        ]}>
                          {order}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.signingOrderHint}>
                    Sequential: Signers must sign in order. Parallel: All can sign simultaneously.
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Signers <Text style={styles.required}>*</Text> ({selectedSigners.length} selected)</Text>
                  <TouchableOpacity 
                    style={styles.selectSignersButton}
                    onPress={handleSelectSigners}
                  >
                    <Users size={20} color={Colors.brand.light} />
                    <Text style={styles.selectSignersText}>Select Signers</Text>
                  </TouchableOpacity>
                  {selectedSigners.length > 0 && (
                    <View style={styles.selectedSigners}>
                      {selectedSigners.map((signer, index) => (
                        <View key={signer.id} style={styles.selectedSigner}>
                          <Text style={styles.selectedSignerText}>
                            {index + 1}. {signer.name}
                          </Text>
                          <Text style={styles.selectedSignerRole}>
                            {signer.designation}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Document Upload (Optional)</Text>
                  <TouchableOpacity 
                    style={[
                      styles.uploadButton,
                      documentUploaded && styles.uploadButtonUploaded
                    ]}
                    onPress={handleDocumentUpload}
                  >
                    <Upload size={20} color={documentUploaded ? Colors.status.success : Colors.brand.light} />
                    <Text style={[
                      styles.uploadButtonText,
                      documentUploaded && styles.uploadButtonTextUploaded
                    ]}>
                      {documentUploaded ? "Document Uploaded ✓" : "Upload Document (PDF, Image)"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateRequest}
              >
                <Text style={styles.createButtonText}>Create Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Select Signers Modal */}
      <Modal
        visible={showSignerModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signerModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>Select Signers</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSignerModal(false)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {EMPLOYEES.filter(emp => emp.id !== employee.id).map((emp) => {
                const isSelected = selectedSigners.find(s => s.id === emp.id);
                const unsignedDocs = docs.filter(doc => 
                  doc.signers.some(signer => signer.id === emp.id && signer.status === "pending")
                ).length;
                
                return (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.signerOption,
                      isSelected && styles.signerOptionSelected
                    ]}
                    onPress={() => toggleSigner(emp)}
                  >
                    <View style={styles.signerOptionLeft}>
                      <View style={styles.signerAvatar}>
                        <User size={20} color={Colors.slate[400]} />
                      </View>
                      <View style={styles.signerOptionInfo}>
                        <Text style={styles.signerOptionName}>{emp.name}</Text>
                        <Text style={styles.signerOptionRole}>{emp.designation}</Text>
                        <Text style={styles.signerOptionDocs}>
                          {unsignedDocs} unsigned documents
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setShowSignerModal(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                  {selectedDoc?.dept} • {selectedDoc?.route}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDoc(null)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Document Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Document ID:</Text>
                  <Text style={styles.detailValue}>{selectedDoc?.id}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Issuing Person:</Text>
                  <Text style={styles.detailValue}>
                    {EMPLOYEES.find(e => e.id === selectedDoc?.owner)?.name || "Unknown"}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDoc && formatDate(selectedDoc.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Deadline:</Text>
                  <Text style={styles.detailValue}>
                    {selectedDoc && formatDate(selectedDoc.deadline)}
                  </Text>
                </View>
                
                {selectedDoc?.completedAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completed:</Text>
                    <Text style={[styles.detailValue, { color: Colors.status.success }]}>
                      {formatDate(selectedDoc.completedAt)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Signing Order:</Text>
                  <Text style={styles.detailValue}>{selectedDoc?.route}</Text>
                </View>
              </View>

              {/* Signers Section */}
              <View style={styles.signersSection}>
                <Text style={styles.sectionTitle}>Signers ({selectedDoc?.signers.length})</Text>
                
                {selectedDoc?.signers.map((signer, index) => {
                  const isCurrentUser = signer.id === employee.id;
                  const canSignNow = selectedDoc && canSign(selectedDoc).ok && isCurrentUser;
                  
                  return (
                    <View
                      key={signer.id}
                      style={[
                        styles.signerCard,
                        canSignNow && styles.signerCardActive,
                        isCurrentUser && styles.currentUserCard,
                      ]}
                    >
                      <View style={styles.signerLeft}>
                        <View style={styles.signerAvatar}>
                          <User size={20} color={Colors.slate[400]} />
                        </View>
                        <View style={styles.signerInfo}>
                          <Text style={styles.signerName}>
                            {index + 1}. {signer.name}
                          </Text>
                          <Text style={styles.signerDesignation}>
                            {signer.designation}
                          </Text>
                          {signer.signedAt && (
                            <Text style={styles.signedDate}>
                              Signed on {formatDate(signer.signedAt)}
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.signerRight}>
                        <View style={[
                          styles.signerStatus,
                          signer.status === "signed" && styles.signedStatus,
                          signer.status === "pending" && styles.pendingStatus,
                        ]}>
                          <Text style={[
                            styles.signerStatusText,
                            signer.status === "signed" && styles.signedStatusText,
                            signer.status === "pending" && styles.pendingStatusText,
                          ]}>
                            {signer.status === "signed" ? "Signed" : "Pending"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Action Footer */}
            <View style={styles.modalFooter}>
              {selectedDoc && canSign(selectedDoc).ok ? (
                <TouchableOpacity
                  style={styles.signButton}
                  onPress={() => handleSign(selectedDoc)}
                >
                  <Text style={styles.signButtonText}>Sign Document</Text>
                </TouchableOpacity>
              ) : selectedDoc && selectedDoc.signers.find(s => s.id === employee.id)?.status === "signed" ? (
                <View style={styles.alreadySignedButton}>
                  <Text style={styles.alreadySignedText}>Already signed</Text>
                </View>
              ) : (
                <View style={styles.disabledButton}>
                  <Text style={styles.disabledButtonText}>
                    {selectedDoc ? canSign(selectedDoc).reason : "Cannot sign"}
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
              Place your finger on the sensor to sign the document
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
              Your digital signature has been applied successfully
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
  },
  tabs: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: Colors.neutral[900],
    borderRadius: 8,
    padding: 4,
    marginRight: 12,
  },
  tab: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  tabActive: {
    backgroundColor: Colors.brand.light,
  },
  tabText: {
    color: Colors.slate[400],
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
  },
  tabTextActive: {
    color: Colors.neutral[900],
    fontWeight: "600",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.brand.light,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    borderLeftWidth: 4,
    backgroundColor: Colors.neutral[900] + "99",
    gap: 8,
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  docTitle: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.slate[100],
    fontSize: 11,
    fontWeight: "600",
  },
  docMeta: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  docFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  signerAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral[700],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.neutral[900],
  },
  moreAvatar: {
    backgroundColor: Colors.brand.light + "33",
  },
  moreText: {
    color: Colors.brand.light,
    fontSize: 10,
    fontWeight: "600",
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
    paddingRight: 16,
  },
  modalTitle: {
    color: Colors.slate[200],
    fontSize: 18,
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
  detailsSection: {
    marginBottom: 24,
    backgroundColor: Colors.neutral[800],
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700],
  },
  detailLabel: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  signersSection: {
    gap: 12,
  },
  sectionTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  signerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.neutral[800],
  },
  signerCardActive: {
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  currentUserCard: {
    borderColor: Colors.status.info,
    backgroundColor: Colors.status.info + "11",
  },
  signerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  signerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[700],
    justifyContent: "center",
    alignItems: "center",
  },
  signerInfo: {
    flex: 1,
  },
  signerName: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  signerDesignation: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  signedDate: {
    color: Colors.status.success,
    fontSize: 11,
    marginTop: 2,
  },
  signerRight: {
    alignItems: "flex-end",
  },
  signerStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  signedStatus: {
    backgroundColor: Colors.status.success + "22",
    borderColor: Colors.status.success,
  },
  pendingStatus: {
    backgroundColor: "#f59e0b" + "22",
    borderColor: "#f59e0b",
  },
  signerStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  signedStatusText: {
    color: Colors.status.success,
  },
  pendingStatusText: {
    color: "#f59e0b",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[800],
  },
  signButton: {
    backgroundColor: Colors.brand.light,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  signButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "600",
  },
  alreadySignedButton: {
    backgroundColor: Colors.status.success + "22",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.status.success,
  },
  alreadySignedText: {
    color: Colors.status.success,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: Colors.neutral[700],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButtonText: {
    color: Colors.slate[400],
    fontSize: 16,
    fontWeight: "500",
  },
  biometricModal: {
    backgroundColor: Colors.neutral[800],
    borderRadius: 20,
    padding: 32,
    margin: 20,
    alignItems: "center",
    gap: 16,
  },
  biometricIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.status.info + "22",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  biometricTitle: {
    color: Colors.slate[100],
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  biometricText: {
    color: Colors.slate[400],
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  biometricButton: {
    backgroundColor: Colors.status.info + "22",
    borderWidth: 2,
    borderColor: Colors.status.info,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  biometricButtonText: {
    color: Colors.status.info,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "500",
  },
  successModal: {
    backgroundColor: Colors.neutral[800],
    borderRadius: 20,
    padding: 32,
    margin: 20,
    alignItems: "center",
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.status.success + "22",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  successCheckmark: {
    color: Colors.status.success,
    fontSize: 32,
    fontWeight: "bold",
  },
  successTitle: {
    color: Colors.slate[100],
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  successText: {
    color: Colors.slate[400],
    fontSize: 14,
    textAlign: "center",
  },
  // Create Signing Request Styles
  createForm: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    color: Colors.slate[300],
    fontSize: 14,
    fontWeight: "500",
  },
  required: {
    color: Colors.status.error,
  },
  formInput: {
    backgroundColor: Colors.neutral[800],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.slate[200],
    fontSize: 14,
  },
  issuingPersonContainer: {
    backgroundColor: Colors.neutral[800],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  issuingPersonText: {
    color: Colors.slate[200],
    fontSize: 14,
  },
  priorityButtons: {
    flexDirection: "row",
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.neutral[800],
    alignItems: "center",
  },
  priorityButtonActive: {
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "22",
  },
  priorityButtonHigh: {
    borderColor: "#f59e0b",
    backgroundColor: "#f59e0b" + "22",
  },
  priorityButtonCritical: {
    borderColor: Colors.status.error,
    backgroundColor: Colors.status.error + "22",
  },
  priorityButtonText: {
    color: Colors.slate[300],
    fontSize: 14,
    fontWeight: "500",
  },
  priorityButtonTextActive: {
    color: Colors.brand.light,
    fontWeight: "600",
  },
  signingOrderButtons: {
    flexDirection: "row",
    gap: 12,
  },
  signingOrderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.neutral[800],
    alignItems: "center",
  },
  signingOrderButtonActive: {
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "22",
  },
  signingOrderButtonText: {
    color: Colors.slate[300],
    fontSize: 14,
    fontWeight: "500",
  },
  signingOrderButtonTextActive: {
    color: Colors.brand.light,
    fontWeight: "600",
  },
  signingOrderHint: {
    color: Colors.slate[500],
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  selectSignersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.brand.light,
    backgroundColor: Colors.neutral[800],
  },
  selectSignersText: {
    color: Colors.brand.light,
    fontSize: 14,
    fontWeight: "500",
  },
  selectedSigners: {
    marginTop: 8,
    gap: 8,
  },
  selectedSigner: {
    backgroundColor: Colors.neutral[700],
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand.light,
  },
  selectedSignerText: {
    color: Colors.slate[200],
    fontSize: 13,
    fontWeight: "500",
  },
  selectedSignerRole: {
    color: Colors.slate[400],
    fontSize: 11,
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.brand.light,
    backgroundColor: Colors.neutral[800],
  },
  uploadButtonUploaded: {
    borderColor: Colors.status.success,
    backgroundColor: Colors.status.success + "22",
  },
  uploadButtonText: {
    color: Colors.brand.light,
    fontSize: 14,
    fontWeight: "500",
  },
  uploadButtonTextUploaded: {
    color: Colors.status.success,
  },
  createButton: {
    backgroundColor: Colors.brand.light,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "600",
  },
  // Signer Selection Modal Styles
  signerModalContent: {
    backgroundColor: Colors.neutral[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  signerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.neutral[800],
    marginBottom: 8,
  },
  signerOptionSelected: {
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  signerOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  signerOptionInfo: {
    flex: 1,
  },
  signerOptionName: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  signerOptionRole: {
    color: Colors.slate[400],
    fontSize: 12,
    marginBottom: 2,
  },
  signerOptionDocs: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "500",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.light,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIndicatorText: {
    color: Colors.neutral[900],
    fontSize: 12,
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: Colors.brand.light,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: "600",
  },
});