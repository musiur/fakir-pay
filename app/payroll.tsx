import AsyncStorage from "@react-native-async-storage/async-storage";
import { Download } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../constants/Colors";
import { EMPLOYEES } from "../constants/Data";
import { Employee } from "../types";

interface PayslipData {
  month: string;
  year: string;
  netSalary: string;
}

export default function PayrollScreen() {
  const [employee, setEmployee] = useState<Employee>(EMPLOYEES[0]);

  const salaryBreakdown = [
    { label: "Basic Salary", amount: "৳ 30,000" },
    { label: "House Rent", amount: "৳ 15,000" },
    { label: "Medical Allowance", amount: "৳ 2,000" },
    { label: "Conveyance", amount: "৳ 2,000" },
    { label: "Total Gross", amount: "৳ 49,000", isTotal: true },
    { label: "Tax Deduction", amount: "৳ 1,200", isDeduction: true },
    { label: "Net Salary", amount: "৳ 47,800", isNet: true },
  ];

  const payslips: PayslipData[] = [
    { month: "August", year: "2025", netSalary: "৳ 47,800" },
    { month: "July", year: "2025", netSalary: "৳ 47,800" },
    { month: "June", year: "2025", netSalary: "৳ 47,800" },
    { month: "May", year: "2025", netSalary: "৳ 47,800" },
  ];

  useEffect(() => {
    AsyncStorage.getItem("employeeId").then((id) => {
      const emp = EMPLOYEES.find((e) => e.id === id);
      if (emp) setEmployee(emp);
    });
  }, []);

  const handleDownload = (month: string, year: string) => {
    Alert.alert(
      "Download Payslip",
      `Download payslip for ${month} ${year}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Download", 
          onPress: () => Alert.alert("Demo", "In a real app, this would download the PDF payslip") 
        }
      ]
    );
  };

  const getAmountStyle = (item: any) => {
    if (item.isNet) {
      return [styles.salaryAmount, styles.netSalaryAmount];
    }
    if (item.isDeduction) {
      return [styles.salaryAmount, styles.deductionAmount];
    }
    if (item.isTotal) {
      return [styles.salaryAmount, styles.totalAmount];
    }
    return styles.salaryAmount;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Monthly Salary Breakdown */}
        <View style={styles.salaryCard}>
          <Text style={styles.cardTitle}>Monthly Salary Breakdown</Text>
          <View style={styles.salaryGrid}>
            {salaryBreakdown.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.salaryRow,
                  item.isTotal && styles.totalRow,
                  item.isNet && styles.netRow
                ]}
              >
                <Text style={[
                  styles.salaryLabel,
                  item.isNet && styles.netSalaryLabel
                ]}>
                  {item.label}
                </Text>
                <Text style={getAmountStyle(item)}>
                  {item.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payslips */}
        <View style={styles.payslipsCard}>
          <Text style={styles.cardTitle}>Payslips</Text>
          {payslips.map((payslip, index) => (
            <View key={index} style={styles.payslipItem}>
              <View style={styles.payslipInfo}>
                <Text style={styles.payslipMonth}>
                  {payslip.month} {payslip.year}
                </Text>
                <Text style={styles.payslipAmount}>
                  Net: {payslip.netSalary}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => handleDownload(payslip.month, payslip.year)}
              >
                <Download size={16} color={Colors.brand.light} />
                <Text style={styles.downloadText}>Download</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  salaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  salaryGrid: {
    gap: 0,
  },
  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[800],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    marginTop: 8,
    paddingTop: 16,
  },
  netRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.brand.light,
    marginTop: 8,
    paddingTop: 16,
    backgroundColor: Colors.brand.light + "11",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  salaryLabel: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "500",
  },
  netSalaryLabel: {
    color: Colors.slate[200],
    fontWeight: "600",
  },
  salaryAmount: {
    color: Colors.slate[200],
    fontSize: 14,
    fontWeight: "600",
  },
  totalAmount: {
    color: Colors.slate[100],
    fontWeight: "700",
  },
  deductionAmount: {
    color: Colors.status.error,
  },
  netSalaryAmount: {
    color: Colors.brand.light,
    fontSize: 16,
    fontWeight: "700",
  },
  payslipsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[900] + "CC",
    padding: 20,
  },
  payslipItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[800],
    backgroundColor: Colors.neutral[800] + "33",
    marginBottom: 12,
  },
  payslipInfo: {
    flex: 1,
  },
  payslipMonth: {
    color: Colors.slate[200],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  payslipAmount: {
    color: Colors.slate[400],
    fontSize: 12,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.brand.light,
    backgroundColor: Colors.brand.light + "11",
  },
  downloadText: {
    color: Colors.brand.light,
    fontSize: 12,
    fontWeight: "600",
  },
});