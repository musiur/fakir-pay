import { Download, Flag, Search, Share2, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { KB_DOCS } from "../../constants/Data";
import { KBDocument } from "../../types";

const CATEGORIES = [
  "HR Policies",
  "Compliance",
  "IT & Security",
  "Operations",
  "Safety",
  "Legal",
];

export default function KnowledgeBaseScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null);

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

  return (
    <View style={styles.container}>
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
              <TouchableOpacity style={styles.footerButton}>
                <Download size={18} color={Colors.slate[200]} />
                <Text style={styles.footerButtonText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton}>
                <Share2 size={18} color={Colors.slate[200]} />
                <Text style={styles.footerButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonReport]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  resultsCount: {
    color: Colors.slate[200],
    fontSize: 14,
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
});
