import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import DatePicker from './DatePicker';

// This is a demo component showing how to use the DatePicker
const DatePickerDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date Picker Demo</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Single Date Selection</Text>
        <DatePicker
          value={selectedDate}
          onDateChange={setSelectedDate}
          placeholder="Select a date"
          minDate={new Date()} // Only allow future dates
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>From Date</Text>
        <DatePicker
          value={fromDate}
          onDateChange={setFromDate}
          placeholder="Select from date"
          minDate={new Date()}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>To Date</Text>
        <DatePicker
          value={toDate}
          onDateChange={setToDate}
          placeholder="Select to date"
          minDate={fromDate ? new Date(fromDate) : new Date()} // To date must be after from date
        />
      </View>

      {(selectedDate || fromDate || toDate) && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Selected Dates:
          </Text>
          {selectedDate && (
            <Text style={styles.dateText}>Single Date: {selectedDate}</Text>
          )}
          {fromDate && (
            <Text style={styles.dateText}>From: {fromDate}</Text>
          )}
          {toDate && (
            <Text style={styles.dateText}>To: {toDate}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.neutral[950],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.slate[100],
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: Colors.slate[200],
    marginBottom: 8,
    fontWeight: '500',
  },
  result: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.neutral[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  resultText: {
    fontSize: 16,
    color: Colors.slate[100],
    fontWeight: '600',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: Colors.brand.light,
    marginBottom: 4,
  },
});

export default DatePickerDemo;