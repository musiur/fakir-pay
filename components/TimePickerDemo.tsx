import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import TimePicker from './TimePicker';

// This is a demo component showing how to use the TimePicker
// You can replace TimePicker with ClockPicker if you prefer the clock dial interface

const TimePickerDemo: React.FC = () => {
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Picker Demo</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Clock In Time</Text>
        <TimePicker
          value={clockInTime}
          onTimeChange={setClockInTime}
          placeholder="Select clock in time"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Clock Out Time</Text>
        <TimePicker
          value={clockOutTime}
          onTimeChange={setClockOutTime}
          placeholder="Select clock out time"
        />
      </View>

      {(clockInTime || clockOutTime) && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Selected Times:
          </Text>
          {clockInTime && (
            <Text style={styles.timeText}>Clock In: {clockInTime}</Text>
          )}
          {clockOutTime && (
            <Text style={styles.timeText}>Clock Out: {clockOutTime}</Text>
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
  timeText: {
    fontSize: 14,
    color: Colors.brand.light,
    marginBottom: 4,
  },
});

export default TimePickerDemo;