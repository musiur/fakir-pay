import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Camera, LogOut } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { EMPLOYEES } from "../../constants/Data";
import { Employee } from "../../types";

// Demo profile images for simulation
const DEMO_PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
];

export default function ProfileScreen() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);
  const [profileImage, setProfileImage] = useState<string>(DEMO_PROFILE_IMAGES[0]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) {
        setEmployee(emp);
      }
    });
    
    // Load saved profile image
    AsyncStorage.getItem("profileImage").then((savedImage) => {
      if (savedImage) {
        setProfileImage(savedImage);
      }
    });
  }, []);

  const handleImageUpload = () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose an option",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Choose from Gallery",
          onPress: () => simulateImageUpload()
        },
        {
          text: "Take Photo",
          onPress: () => simulateImageUpload()
        }
      ]
    );
  };

  const simulateImageUpload = () => {
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      // Randomly select a new demo image
      const currentIndex = DEMO_PROFILE_IMAGES.indexOf(profileImage);
      const availableImages = DEMO_PROFILE_IMAGES.filter((_, index) => index !== currentIndex);
      const newImage = availableImages[Math.floor(Math.random() * availableImages.length)];
      
      setProfileImage(newImage);
      setIsUploading(false);
      
      // Save to AsyncStorage for persistence
      AsyncStorage.setItem("profileImage", newImage);
      
      Alert.alert(
        "Success",
        "Profile picture updated successfully! (Demo mode - using sample images)"
      );
    }, 2000);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("employeeId");
          router.replace("/(auth)/login");
        },
      },
    ]);
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {isUploading ? (
                  <View style={styles.uploadingOverlay}>
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImage}
                  />
                )}
              </View>
              <TouchableOpacity 
                style={[styles.cameraButton, isUploading && styles.cameraButtonDisabled]}
                onPress={handleImageUpload}
                disabled={isUploading}
              >
                <Camera size={16} color={isUploading ? Colors.slate[500] : Colors.brand.light} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{employee.name}</Text>
              <Text style={styles.profileDesignation}>
                {employee.designation}
              </Text>
              <Text style={styles.profileDepartment}>
                {employee.department}
              </Text>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Employee ID</Text>
              <Text style={styles.detailValue}>{employee.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Join Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(employee.joinDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shift</Text>
              <Text style={styles.detailValue}>{employee.shift}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Biometrics</Text>
              <View
                style={[
                  styles.biometricBadge,
                  employee.biometricsEnabled
                    ? styles.biometricEnabled
                    : styles.biometricDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.biometricText,
                    employee.biometricsEnabled
                      ? styles.biometricTextEnabled
                      : styles.biometricTextDisabled,
                  ]}
                >
                  {employee.biometricsEnabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{employee.phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Emergency Contact</Text>
            <Text style={styles.infoValue}>{employee.emergency}</Text>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Medical Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Blood Group</Text>
            <Text style={styles.infoValue}>{employee.medicalInfo.bloodGroup}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Allergies</Text>
            <Text style={styles.infoValue}>{employee.medicalInfo.allergies}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Insurance ID</Text>
            <Text style={styles.infoValue}>{employee.medicalInfo.insuranceId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Checkup</Text>
            <Text style={styles.infoValue}>
              {formatDate(employee.medicalInfo.lastCheckup)}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.neutral[700],
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
  },
  uploadingOverlay: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    backgroundColor: Colors.neutral[800],
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: Colors.slate[400],
    fontSize: 12,
    fontWeight: "500",
  },
  cameraButton: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral[800],
    borderWidth: 2,
    borderColor: Colors.neutral[900],
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButtonDisabled: {
    backgroundColor: Colors.neutral[700],
    borderColor: Colors.neutral[800],
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors.slate[100],
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileDesignation: {
    color: Colors.slate[400],
    fontSize: 14,
    marginBottom: 2,
  },
  profileDepartment: {
    color: Colors.slate[500],
    fontSize: 12,
  },
  profileDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
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
  },
  biometricBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  biometricEnabled: {
    backgroundColor: Colors.status.success + "22",
    borderWidth: 1,
    borderColor: Colors.status.success,
  },
  biometricDisabled: {
    backgroundColor: Colors.status.error + "22",
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  biometricText: {
    fontSize: 12,
    fontWeight: "600",
  },
  biometricTextEnabled: {
    color: Colors.status.success,
  },
  biometricTextDisabled: {
    color: Colors.status.error,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  cardTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  infoLabel: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.status.error,
    backgroundColor: "transparent",
    marginTop: 8,
  },
  logoutText: {
    color: Colors.status.error,
    fontSize: 16,
    fontWeight: "600",
  },
});
