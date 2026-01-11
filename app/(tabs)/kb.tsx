import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Flag,
  Plus,
  Search,
  Share2,
  X
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/Colors";
import { KB_DOCS } from "../../constants/Data";
import { Issue, KBDocument } from "../../types";

const CATEGORIES = [
  "HR Policies",
  "Compliance", 
  "IT & Security",
  "Operations",
  "Safety",
  "Legal",
];

const SAMPLE_ISSUES: Issue[] = [
  {
    id: "ISS-001",
    reporter: "Fuad Tasrim Hossain (Merchandising)",
    department: "Facilities",
    area: "Meeting Room - Floor 3",
    description: "The air conditioning in the meeting room is not working properly. Temperature is too high and affecting productivity during meetings.",
    priority: "Moderate",
    status: "Open",
    reportedDate: "2025-11-28"
  },
  {
    id: "ISS-002", 
    reporter: "Ayesha Rahman (HR & Admin)",
    department: "HR",
    area: "Leave Policy Documentation",
    description: "Found a typo in the Leave Policy document regarding casual leave. Section 2.3 mentions '12 days' but should be '10 days' as per company policy.",
    priority: "Low",
    status: "Resolved",
    reportedDate: "2025-11-25"
  },
  {
    id: "ISS-003",
    reporter: "Fuad Tasrim Hossain (Merchandising)",
    department: "IT",
    area: "Payroll System",
    description: "Unable to access payroll system after recent password reset. Getting authentication error despite using correct credentials.",
    priority: "High", 
    status: "Open",
    reportedDate: "2025-11-27"
  }
];

export default function KnowledgeBaseScreen() {
  const [activeTab, setActiveTab] = useState<"Documents" | "My Issues">("Documents");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [issues, setIssues] = useState<Issue[]>(SAMPLE_ISSUES);
  const [newIssue, setNewIssue] = useState({
    department: "",
    area: "",
    description: "",
    priority: "Moderate" as "Low" | "Moderate" | "High"
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filtered = KB_DOCS.filter((doc) => {
    const inCat =
      selectedCategories.length === 0 ||
      selectedCategories.includes(doc.category);
    if (!inCat) return false;

    if (!search.trim()) return true;

    const searchLower = search.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.excerpt.toLowerCase().includes(searchLower) ||
      doc.category.toLowerCase().includes(searchLower)
    );
  });

  const handleShare = async () => {
    setShowShareModal(false);
    try {
      await Share.share({
        message: `${selectedDoc?.title}\n\n${selectedDoc?.excerpt}\n\nShared from FakirPay Knowledge Base`,
        title: selectedDoc?.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleShareEmail = () => {
    setShowShareModal(false);
    const subject = encodeURIComponent(selectedDoc?.title || '');
    const body = encodeURIComponent(`${selectedDoc?.title}\n\n${selectedDoc?.excerpt}\n\nShared from FakirPay Knowledge Base`);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareWhatsApp = () => {
    setShowShareModal(false);
    const text = encodeURIComponent(`${selectedDoc?.title}\n\n${selectedDoc?.excerpt}\n\nShared from FakirPay Knowledge Base`);
    Linking.openURL(`whatsapp://send?text=${text}`);
  };

  const handleCopyLink = () => {
    setShowShareModal(false);
    Alert.alert("Link Copied", "Document link has been copied to clipboard");
  };

  const handleReport = () => {
    setShowReportModal(false);
    Alert.alert("Report Submitted", "Thank you for reporting this issue. We'll review it shortly.");
  };

  const handleSubmitIssue = () => {
    if (!newIssue.department || !newIssue.area || !newIssue.description) {
      Alert.alert("Required Fields", "Please fill in all required fields");
      return;
    }
    
    // Generate new issue ID
    const issueNumber = (issues.length + 1).toString().padStart(3, '0');
    const newIssueId = `ISS-${issueNumber}`;
    
    // Create new issue object
    const issueToAdd: Issue = {
      id: newIssueId,
      reporter: "Fuad Tasrim Hossain (Merchandising)",
      department: newIssue.department,
      area: newIssue.area,
      description: newIssue.description,
      priority: newIssue.priority,
      status: "Open",
      reportedDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    };
    
    // Add to issues list (add at the beginning to show as most recent)
    setIssues(prevIssues => [issueToAdd, ...prevIssues]);
    
    // Reset form and close modal
    setShowNewIssueModal(false);
    setNewIssue({ department: "", area: "", description: "", priority: "Moderate" });
    
    // Switch to My Issues tab to show the new issue
    setActiveTab("My Issues");
    
    Alert.alert("Issue Reported", `Your issue has been submitted successfully with ID: ${newIssueId}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return Colors.status.error;
      case "Moderate": return "#f59e0b";
      case "Low": return Colors.status.success;
      default: return Colors.slate[400];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <Clock size={16} color="#f59e0b" />;
      case "Resolved": return <CheckCircle size={16} color={Colors.status.success} />;
      default: return <AlertCircle size={16} color={Colors.slate[400]} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Documents" && styles.tabActive]}
            onPress={() => setActiveTab("Documents")}
          >
            <Text style={[styles.tabText, activeTab === "Documents" && styles.tabTextActive]}>
              Documents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "My Issues" && styles.tabActive]}
            onPress={() => setActiveTab("My Issues")}
          >
            <Text style={[styles.tabText, activeTab === "My Issues" && styles.tabTextActive]}>
              My Issues
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Documents Tab */}
      {activeTab === "Documents" && (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={18} color={Colors.slate[400]} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search SOPs, policies, templates"
                placeholderTextColor={Colors.slate[500]}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <X size={18} color={Colors.slate[400]} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContent}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(cat) && styles.categoryChipActive,
                  ]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategories.includes(cat) && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filtered.length} {filtered.length === 1 ? "Document" : "Documents"}
            </Text>
            <TouchableOpacity 
              style={styles.reportIssueButton}
              onPress={() => setShowNewIssueModal(true)}
            >
              <Flag size={16} color={Colors.status.error} />
              <Text style={styles.reportIssueText}>Report Issue</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {filtered.length === 0 && (
              <Text style={styles.emptyText}>
                No results found. Try different keywords.
              </Text>
            )}
            {filtered.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docCard}
                onPress={() => setSelectedDoc(doc)}
              >
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docMeta}>
                  {doc.category} • Updated{" "}
                  {new Date(doc.lastUpdated).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {doc.ownerDept && ` • ${doc.ownerDept}`}
                </Text>
                <Text style={styles.docExcerpt} numberOfLines={2}>
                  {doc.excerpt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* My Issues Tab */}
      {activeTab === "My Issues" && (
        <>
          <View style={styles.issuesHeader}>
            <View style={styles.issuesHeaderLeft}>
              <Text style={styles.issuesTitle}>Reported Issues</Text>
              <Text style={styles.issuesCount}>
                {issues.length} {issues.length === 1 ? "Issue" : "Issues"}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.newIssueButton}
              onPress={() => setShowNewIssueModal(true)}
            >
              <Plus size={16} color={Colors.brand.light} />
              <Text style={styles.newIssueText}>New Issue</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {issues.length === 0 ? (
              <Text style={styles.emptyText}>
                No issues reported yet.
              </Text>
            ) : (
              issues.map((issue, index) => (
                <View key={issue.id} style={[
                  styles.issueCard,
                  index === 0 && issue.reportedDate === new Date().toISOString().split('T')[0] && styles.newIssueCard
                ]}>
                  <View style={styles.issueHeader}>
                    <View style={styles.issueIdContainer}>
                      <Text style={styles.issueId}>{issue.id}</Text>
                      {index === 0 && issue.reportedDate === new Date().toISOString().split('T')[0] && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.issuePriority}>
                      <Text style={[styles.priorityText, { color: getPriorityColor(issue.priority) }]}>
                        {issue.priority}
                      </Text>
                      {getStatusIcon(issue.status)}
                      <Text style={styles.statusText}>{issue.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.issueDetails}>
                    <Text style={styles.issueLabel}>Reporter:</Text>
                    <Text style={styles.issueValue}>{issue.reporter}</Text>
                  </View>
                  
                  <View style={styles.issueDetails}>
                    <Text style={styles.issueLabel}>Department:</Text>
                    <Text style={styles.issueValue}>{issue.department}</Text>
                  </View>
                  
                  <View style={styles.issueDetails}>
                    <Text style={styles.issueLabel}>Area:</Text>
                    <Text style={styles.issueValue}>{issue.area}</Text>
                  </View>
                  
                  <Text style={styles.issueDescription}>{issue.description}</Text>
                  
                  <Text style={styles.issueDate}>
                    Reported on {new Date(issue.reportedDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Document Detail Modal */}
      <Modal visible={!!selectedDoc} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>{selectedDoc?.title}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedDoc?.category} • Updated{" "}
                  {selectedDoc &&
                    new Date(selectedDoc.lastUpdated).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDoc(null)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Overview</Text>
                <Text style={styles.sectionText}>{selectedDoc?.excerpt}</Text>
              </View>

              {selectedDoc?.chunks?.map((chunk, i) => (
                <View key={i} style={styles.chunk}>
                  <Text style={styles.chunkHeading}>{chunk.heading}</Text>
                  <Text style={styles.chunkText}>{chunk.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => Alert.alert("Download", "Document download started")}
              >
                <Download size={18} color={Colors.slate[200]} />
                <Text style={styles.footerButtonText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.footerButton}
                onPress={() => setShowShareModal(true)}
              >
                <Share2 size={18} color={Colors.slate[200]} />
                <Text style={styles.footerButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonReport]}
                onPress={() => setShowReportModal(true)}
              >
                <Flag size={18} color={Colors.status.error} />
                <Text
                  style={[
                    styles.footerButtonText,
                    { color: Colors.status.error },
                  ]}
                >
                  Report
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent animationType="fade">
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <Text style={styles.shareModalTitle}>Share Document</Text>
            
            <TouchableOpacity style={styles.shareOption} onPress={handleShareEmail}>
              <Text style={styles.shareOptionText}>Share via Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption} onPress={handleShareWhatsApp}>
              <Text style={styles.shareOptionText}>Share via WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
              <Text style={styles.shareOptionText}>Copy Link</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareCancel} 
              onPress={() => setShowShareModal(false)}
            >
              <Text style={styles.shareCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={showReportModal} transparent animationType="fade">
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <Text style={styles.shareModalTitle}>Report Document Issue</Text>
            <Text style={styles.reportSubtitle}>Why are you reporting this document?</Text>
            
            {["Outdated Content", "Incorrect Information", "Formatting Issues", "Other"].map((reason) => (
              <TouchableOpacity 
                key={reason}
                style={styles.shareOption} 
                onPress={() => {
                  setReportReason(reason);
                  handleReport();
                }}
              >
                <Text style={styles.shareOptionText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.shareCancel} 
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.shareCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Issue Modal */}
      <Modal visible={showNewIssueModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>Report an Issue</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNewIssueModal(false)}>
                <X size={24} color={Colors.slate[300]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.reporterInfo}>
                <Text style={styles.reporterLabel}>Reporter Information</Text>
                <View style={styles.reporterDetails}>
                  <Text style={styles.reporterText}>Name: Fuad Tasrim Hossain</Text>
                  <Text style={styles.reporterText}>Department: Merchandising</Text>
                </View>
              </View>

              <View style={styles.issueDetailsSection}>
                <Text style={styles.reporterLabel}>Issue Details</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Issue Department <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.formInput}
                    value={newIssue.department}
                    onChangeText={(text) => setNewIssue({...newIssue, department: text})}
                    placeholder="e.g., IT, HR, Facilities, Operations"
                    placeholderTextColor={Colors.slate[500]}
                  />
                  <Text style={styles.formHint}>
                    Common departments: IT, HR, Facilities, Operations, Finance, Security
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Specific Issue Area <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.formInput}
                    value={newIssue.area}
                    onChangeText={(text) => setNewIssue({...newIssue, area: text})}
                    placeholder="e.g., Payroll System, Meeting Room, Network"
                    placeholderTextColor={Colors.slate[500]}
                  />
                  <Text style={styles.formHint}>
                    Examples: Payroll System, Meeting Room - Floor 3, WiFi Network, Printer, AC Unit
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Issue Description <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={newIssue.description}
                    onChangeText={(text) => setNewIssue({...newIssue, description: text})}
                    placeholder="Describe the issue in detail..."
                    placeholderTextColor={Colors.slate[500]}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Issue Importance <Text style={styles.required}>*</Text></Text>
                  <View style={styles.priorityButtons}>
                    {(["Low", "Moderate", "High"] as const).map((priority) => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.priorityButton,
                          newIssue.priority === priority && styles.priorityButtonActive,
                          priority === "Moderate" && newIssue.priority === priority && styles.priorityButtonModerate,
                        ]}
                        onPress={() => setNewIssue({...newIssue, priority})}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          newIssue.priority === priority && styles.priorityButtonTextActive,
                        ]}>
                          {priority}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.submitButtonContainer}>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitIssue}
              >
                <Text style={styles.submitButtonText}>Submit Issue Report</Text>
              </TouchableOpacity>
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
  header: {
    backgroundColor: Colors.neutral[900] + "CC",
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.brand.light,
  },
  tabText: {
    color: Colors.slate[400],
    fontSize: 16,
    fontWeight: "500",
  },
  tabTextActive: {
    color: Colors.brand.light,
    fontWeight: "600",
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    gap: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.slate[200],
    fontSize: 14,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  categoryChipActive: {
    backgroundColor: Colors.brand.light + "22",
    borderColor: Colors.brand.light,
  },
  categoryText: {
    color: Colors.slate[300],
    fontSize: 12,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: Colors.brand.light,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  resultsCount: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
  },
  reportIssueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  reportIssueText: {
    color: Colors.status.error,
    fontSize: 12,
    fontWeight: "500",
  },
  issuesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  issuesHeaderLeft: {
    flex: 1,
  },
  issuesTitle: {
    color: Colors.slate[200],
    fontSize: 18,
    fontWeight: "600",
  },
  issuesCount: {
    color: Colors.slate[400],
    fontSize: 12,
    marginTop: 2,
  },
  newIssueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.brand.light,
  },
  newIssueText: {
    color: Colors.neutral[900],
    fontSize: 12,
    fontWeight: "600",
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
    borderLeftColor: Colors.brand.light,
    backgroundColor: Colors.neutral[900] + "99",
  },
  docTitle: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  docMeta: {
    color: Colors.slate[400],
    fontSize: 11,
    marginBottom: 8,
  },
  docExcerpt: {
    color: Colors.slate[300],
    fontSize: 13,
    lineHeight: 18,
  },
  issueCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "99",
    gap: 8,
  },
  newIssueCard: {
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issueIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  issueId: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
  },
  newBadge: {
    backgroundColor: Colors.brand.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: Colors.neutral[900],
    fontSize: 10,
    fontWeight: "700",
  },
  issuePriority: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusText: {
    color: Colors.slate[300],
    fontSize: 12,
    fontWeight: "500",
  },
  issueDetails: {
    flexDirection: "row",
    gap: 8,
  },
  issueLabel: {
    color: Colors.slate[400],
    fontSize: 12,
    fontWeight: "500",
    minWidth: 80,
  },
  issueValue: {
    color: Colors.slate[200],
    fontSize: 12,
    flex: 1,
  },
  issueDescription: {
    color: Colors.slate[300],
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  issueDate: {
    color: Colors.slate[500],
    fontSize: 11,
    marginTop: 4,
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
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: Colors.slate[400],
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionText: {
    color: Colors.slate[300],
    fontSize: 14,
    lineHeight: 22,
  },
  chunk: {
    marginBottom: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.brand.light,
  },
  chunkHeading: {
    color: Colors.slate[100],
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  chunkText: {
    color: Colors.slate[300],
    fontSize: 13,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[800],
    gap: 8,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  footerButtonReport: {
    borderColor: Colors.status.error,
  },
  footerButtonText: {
    color: Colors.slate[200],
    fontSize: 13,
    fontWeight: "500",
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareModalContent: {
    backgroundColor: Colors.neutral[800],
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  shareModalTitle: {
    color: Colors.slate[100],
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  reportSubtitle: {
    color: Colors.slate[400],
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  shareOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.neutral[700],
    marginBottom: 12,
  },
  shareOptionText: {
    color: Colors.slate[200],
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  shareCancel: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "transparent",
    marginTop: 8,
  },
  shareCancelText: {
    color: Colors.slate[400],
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  reporterInfo: {
    marginBottom: 24,
  },
  reporterLabel: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  reporterDetails: {
    backgroundColor: Colors.neutral[800],
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  reporterText: {
    color: Colors.slate[300],
    fontSize: 14,
  },
  issueDetailsSection: {
    gap: 16,
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
  formHint: {
    color: Colors.slate[500],
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
  priorityButtonModerate: {
    borderColor: "#f59e0b",
    backgroundColor: "#f59e0b" + "22",
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
  submitButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[800],
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
});