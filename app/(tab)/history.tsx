import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePunchToHistory } from '../utils/attendanceUtils'; // Import the utility function
import { useNavigation } from '@react-navigation/native';

const AttendanceHistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState(6); // July (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2025);

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [totalAttendance, setTotalAttendance] = useState(0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2023, 2024, 2025, 2026];

  type AttendanceRecord = {
    id: number;
    date: string;
    day: string;
    inTime: string | null;
    outTime: string | null;
    status: string;
    isToday: boolean;
  };

  const sampleData: AttendanceRecord[] = [
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
    }
  ];

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth, selectedYear]);

  const loadAttendanceData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('attendanceHistory');
      const attendanceHistory = storedData ? JSON.parse(storedData) : sampleData;

      const filteredData = attendanceHistory.filter((record: { date: string }) => {
        const [day, month, year] = record.date.split('/').map(Number);
        const recordDate = new Date(year, month - 1, day);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
      });

      setAttendanceData(filteredData);
      setTotalAttendance(
        filteredData.filter((r: { status: string; }) => r.status === 'Present' || r.status === 'Late').length
      );
    } catch (error) {
      console.error('Error loading attendance data:', error);
      setAttendanceData(sampleData);
      setTotalAttendance(1);
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
              setAttendanceData((prev) =>
                prev.map((record) =>
                  record.id === recordId ? { ...record, outTime: timeString } : record
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

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Monthly Attendance</Text>
          <Icon name="calendar-today" size={24} color="white" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.totalAttendance}>Total attendance: {totalAttendance}</Text>

        {/* Month-Year Picker */}
        <View style={styles.selectorContainer}>
          {months.map((m, i) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.selector,
                i === selectedMonth && { backgroundColor: '#cde4ce' },
              ]}
              onPress={() => setSelectedMonth(i)}
            >
              <Text style={styles.selectorText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.selectorContainer}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.selector,
                year === selectedYear && { backgroundColor: '#cde4ce' },
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={styles.selectorText}>{year}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Attendance List */}
        <ScrollView>
          {attendanceData.map((record) => (
            <View key={record.id} style={[styles.recordCard, record.isToday && styles.todayCard]}>
              <View style={styles.recordHeader}>
                <Text style={styles.dateText}>Date: {record.date}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
                  <Icon name={getStatusIcon(record.status)} size={14} color="white" />
                  <Text style={styles.statusText}>{record.status}</Text>
                </View>
              </View>
              <Text style={styles.dayText}>Day: {record.day}</Text>
              <Text style={styles.timeText}>In Time: {record.inTime || '—'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.timeText}>Out Time: {record.outTime || '—'}</Text>
                {record.isToday && !record.outTime && (
                  <TouchableOpacity style={styles.checkOutButton} onPress={() => handleCheckOut(record.id)}>
                    <Text style={styles.checkOutButtonText}>Punch Out</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {attendanceData.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No attendance records found</Text>
              <Text style={styles.emptySubText}>
                for {months[selectedMonth]} {selectedYear}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#84a98c',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
  content: {
    flex: 1,
    padding: 16,
  },
  totalAttendance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
  },
  selectorText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  todayCard: {
    borderLeftColor: '#2196F3',
    backgroundColor: '#f0f8ff',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
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
  dayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  checkOutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
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
});

export default AttendanceHistoryScreen;
