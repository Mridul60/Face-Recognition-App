import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Dashboard = () => {
  const [isMarked, setIsMarked] = useState(false);

  const handleMarkAttendance = () => {
    if (isMarked) {
      Alert.alert('Already Marked', 'You have already marked your attendance for today.');
      return;
    }
    
    Alert.alert(
      'Mark Attendance',
      'Are you sure you want to mark your attendance?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark',
          onPress: () => {
            setIsMarked(true);
            Alert.alert('Success', 'Attendance marked successfully!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholderX}>
            <View style={styles.xLine1} />
            <View style={styles.xLine2} />
          </View>
          
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Pan here web/application portal</Text>
          </View>
          
          <View style={styles.dimensions}>
            <Text style={styles.dimensionsText}>202 × 17</Text>
          </View>
        </View>
      </View>

      {/* Attendance Section */}
      <View style={styles.attendanceSection}>
        <Text style={styles.attendanceStatus}>
          {isMarked ? 'Attendance Marked' : 'Already at office'}
        </Text>
        <Text style={styles.attendanceSubtext}>MARK Attendance</Text>
        
        <TouchableOpacity 
          style={[
            styles.markButton,
            isMarked && styles.markButtonDisabled
          ]} 
          onPress={handleMarkAttendance}
          disabled={isMarked}
        >
          <Text style={[
            styles.markButtonText,
            isMarked && styles.markButtonTextDisabled
          ]}>
            {isMarked ? 'MARKED' : 'MARK'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  placeholderX: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine1: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#d0d0d0',
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#d0d0d0',
    transform: [{ rotate: '-45deg' }],
  },
  banner: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  dimensions: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  dimensionsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  attendanceSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  attendanceStatus: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 5,
    fontWeight: '500',
  },
  attendanceSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  markButton: {
    backgroundColor: '#888888',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  markButtonDisabled: {
    backgroundColor: '#4CAF50',
  },
  markButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  markButtonTextDisabled: {
    color: '#ffffff',
  },
});

export default Dashboard;