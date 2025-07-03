import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePunchToHistory } from '../utils/attendanceUtils'; // Import the utility function

type AttendanceHistoryModalProps = {
  visible: boolean;
  onClose: () => void;
};

/*
TODO:   PUNCHOUT IN ATTENDANCE HISTORY
        Replace the sample data with actual data from your backend or local storage 
        Implement the punch in time and punch out time functionality
        Add error handling for network requests
        Implement the month and year picker functionality
        Add loading states for data fetching
*/

const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ visible, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(6); // July (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2025);
  type AttendanceRecord = {
    id: number;
    date: string;
    day: string;
    inTime: string | null;
    outTime: string | null;
    status: string;
    isToday: boolean;
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [totalAttendance, setTotalAttendance] = useState(0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2023, 2024, 2025, 2026];

  // Sample attendance data - replace with actual data source
  const sampleData = [
    {
      id: 1,
      date: '02/07/2025',
      day: 'Wed',
      inTime: '10:00 AM',
      outTime: null,
      status: 'Present',
      isToday: true
    },
    {
      id: 2,
      date: '01/07/2025',
      day: 'Tue',
      inTime: '3:54 PM',
      outTime: '5:14 PM',
      status: 'Late',
      isToday: false
    },
    {
      id: 3,
      date: '30/06/2025',
      day: 'Mon',
      inTime: '9:15 AM',
      outTime: '6:00 PM',
      status: 'Present',
      isToday: false
    },
    {
      id: 4,
      date: '29/06/2025',
      day: 'Sun',
      inTime: null,
      outTime: null,
      status: 'Holiday',
      isToday: false
    },
    {
      id: 5,
      date: '28/06/2025',
      day: 'Sat',
      inTime: null,
      outTime: null,
      status: 'Absent',
      isToday: false
    }
  ];

  useEffect(() => {
    if (visible) {
      loadAttendanceData();
    }
  }, [selectedMonth, selectedYear, visible]);

  const loadAttendanceData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('attendanceHistory');
      let attendanceHistory = storedData ? JSON.parse(storedData) : sampleData;

      const filteredData = attendanceHistory.filter((record: { date: string; }) => {
        const dateParts = record.date.split('/');
        if (dateParts.length !== 3) {
          console.warn('Invalid date format:', record.date);
          return false;
        }
        const [day, month, year] = dateParts.map(Number);
        const recordDate = new Date(year, month - 1, day);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
      });

      setAttendanceData(filteredData);
      setTotalAttendance(filteredData.filter((record: { status: string; }) =>
          record.status === 'Present' || record.status === 'Late'
      ).length);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setAttendanceData(sampleData.slice(0, 2));
      setTotalAttendance(3);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return '#4CAF50';
      case 'Late': return '#FF9800';
      case 'Absent': return '#F44336';
      case 'Holiday': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return 'check-circle';
      case 'Late': return 'access-time';
      case 'Absent': return 'cancel';
      case 'Holiday': return 'event';
      default: return 'help';
    }
  };


  const handleCheckOut = async (recordId: number) => {
    Alert.alert(
        'Punch Out',
        'Do you want to punch out now?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Punch-Out',
            onPress: async () => {
              try {
                const now = new Date();
                const timeString = await savePunchToHistory('out', now);

                // Update local state to reflect the punch-out
                setAttendanceData(prev =>
                    prev.map(record =>
                        record.id === recordId
                            ? { ...record, outTime: timeString }
                            : record
                    )
                );
              } catch (error) {
                Alert.alert('Error', 'Could not complete checkout.');
              }
            },
          },
        ]
    );
  };


  type MonthYearPickerProps = {
    visible: boolean;
    onClose: () => void;
    items: (string | number)[];
    selectedValue: number;
    onSelect: (value: number) => void;
    title: string;
  };

  const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ visible, onClose, items, selectedValue, onSelect, title }) => (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {items.map((item, index) => (
                  <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerItem,
                        (typeof item === 'string' ? index : item) === selectedValue && styles.selectedPickerItem
                      ]}
                      onPress={() => {
                        onSelect(typeof item === 'string' ? index : item);
                        onClose();
                      }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      (typeof item === 'string' ? index : item) === selectedValue && styles.selectedPickerItemText
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
  );

  return (
      <Modal
          transparent
          visible={visible}
          animationType="slide"
          onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Icon name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Monthly Attendance</Text>
                <View style={styles.headerIcon}>
                  <Icon name="calendar-today" size={24} color="white" />
                </View>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.totalAttendance}>Total attendance: {totalAttendance}</Text>

              {/* Month/Year Selectors */}
              <View style={styles.selectorContainer}>
                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowMonthPicker(true)}
                >
                  <Text style={styles.selectorText}>{months[selectedMonth]}</Text>
                  <Icon name="arrow-drop-down" size={20} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowYearPicker(true)}
                >
                  <Text style={styles.selectorText}>{selectedYear}</Text>
                  <Icon name="arrow-drop-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Attendance Records */}
              <ScrollView style={styles.recordsContainer} showsVerticalScrollIndicator={false}>
                {attendanceData.map((record) => (
                    <View key={record.id} style={[
                      styles.recordCard,
                      record.isToday && styles.todayCard
                    ]}>
                      <View style={styles.recordHeader}>
                        <View style={styles.dateSection}>
                          <Icon name="event" size={16} color="#666" />
                          <Text style={styles.dateText}>Date: {record.date}</Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(record.status) }
                        ]}>
                          <Icon
                              name={getStatusIcon(record.status)}
                              size={12}
                              color="white"
                          />
                          <Text style={styles.statusText}>{record.status}</Text>
                        </View>
                      </View>

                      <View style={styles.daySection}>
                        <Icon name="wb-sunny" size={16} color="#666" />
                        <Text style={styles.dayText}>Day: {record.day}</Text>
                      </View>

                      <View style={styles.timeSection}>
                        <View style={styles.timeItem}>
                          <Text style={styles.timeLabel}>In Time: </Text>
                          <Text style={styles.timeValue}>{record.inTime || '—'}</Text>
                        </View>
                        <View style={styles.timeItem}>
                          <Text style={styles.timeLabel}>Out Time: </Text>
                          <Text style={styles.timeValue}>{record.outTime || '—'}</Text>
                          {record.isToday && !record.outTime && (
                              <TouchableOpacity
                                  style={styles.checkOutButton}
                                  onPress={() => handleCheckOut(record.id)}
                              >
                                <Text style={styles.checkOutButtonText}>Punch Out</Text>
                              </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                ))}

                {attendanceData.length === 0 && (
                    <View style={styles.emptyState}>
                      <Icon name="event-busy" size={48} color="#ccc" />
                      <Text style={styles.emptyText}>No attendance records found</Text>
                      <Text style={styles.emptySubText}>for {months[selectedMonth]} {selectedYear}</Text>
                    </View>
                )}
              </ScrollView>
            </View>

            {/* Month Picker Modal */}
            <MonthYearPicker
                visible={showMonthPicker}
                onClose={() => setShowMonthPicker(false)}
                items={months}
                selectedValue={selectedMonth}
                onSelect={setSelectedMonth}
                title="Select Month"
            />

            {/* Year Picker Modal */}
            <MonthYearPicker
                visible={showYearPicker}
                onClose={() => setShowYearPicker(false)}
                items={years}
                selectedValue={selectedYear}
                onSelect={setSelectedYear}
                title="Select Year"
            />
          </View>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    transform: 'translateY(150px)', /* moves it down */
    backgroundColor: '#f5f5f5',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    backgroundColor: '#84a98c',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  totalAttendance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selector: {
    flex: 0.48,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  recordsContainer: {
    flex: 1,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  todayCard: {
    borderLeftColor: '#2196F3',
    backgroundColor: '#f8f9ff',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  daySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  timeSection: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
  },
  checkOutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  checkOutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPickerItem: {
    backgroundColor: '#e8f5e8',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPickerItemText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default AttendanceHistoryModal;