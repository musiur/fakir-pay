import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface TimePickerProps {
  value: string;
  onTimeChange: (time: string) => void;
  placeholder?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onTimeChange,
  placeholder = "Select time"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    value ? parseInt(value.split(':')[0]) : 9
  );
  const [selectedMinute, setSelectedMinute] = useState(
    value ? parseInt(value.split(':')[1]) : 0
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, etc.

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    const timeString = formatTime(selectedHour, selectedMinute);
    onTimeChange(timeString);
    setIsVisible(false);
  };

  const renderTimeSelector = (
    items: number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    label: string
  ) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.timeOption,
              selectedValue === item && styles.selectedTimeOption
            ]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[
                styles.timeOptionText,
                selectedValue === item && styles.selectedTimeOptionText
              ]}
            >
              {item.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.timeInput}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.timeIcon}>🕐</Text>
        <Text style={[
          styles.timeInputText,
          !value && styles.placeholderText
        ]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeDisplay}>
              <Text style={styles.timeDisplayText}>
                {formatTime(selectedHour, selectedMinute)}
              </Text>
            </View>

            <View style={styles.selectorsRow}>
              {renderTimeSelector(hours, selectedHour, setSelectedHour, 'Hours')}
              <View style={styles.separator}>
                <Text style={styles.separatorText}>:</Text>
              </View>
              {renderTimeSelector(minutes, selectedMinute, setSelectedMinute, 'Minutes')}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  timeInputText: {
    flex: 1,
    color: Colors.slate[100],
    fontSize: 16,
  },
  placeholderText: {
    color: Colors.slate[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.neutral[800],
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.slate[100],
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.slate[400],
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: Colors.neutral[900],
    borderRadius: 12,
  },
  timeDisplayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brand.light,
  },
  selectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    height: 200,
  },
  selectorContainer: {
    flex: 1,
  },
  selectorLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.slate[400],
    marginBottom: 10,
  },
  scrollContainer: {
    height: 180,
    backgroundColor: Colors.neutral[900],
    borderRadius: 12,
    paddingVertical: 10,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  selectedTimeOption: {
    backgroundColor: Colors.brand.dark,
  },
  timeOptionText: {
    fontSize: 16,
    color: Colors.slate[300],
  },
  selectedTimeOptionText: {
    color: Colors.slate[100],
    fontWeight: '600',
  },
  separator: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  separatorText: {
    fontSize: 24,
    color: Colors.slate[400],
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral[700],
  },
  confirmButton: {
    backgroundColor: Colors.brand.dark,
  },
  cancelButtonText: {
    color: Colors.slate[300],
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: Colors.slate[100],
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimePicker;