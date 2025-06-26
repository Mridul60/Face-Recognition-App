
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function Dashboard() {
  const [isMarked, setIsMarked] = useState(false);
  const [isAtOffice, setIsAtOffice] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const officeLocation = {
    latitude: 26.138543309537425,
    longitude: 91.80022001149722,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };


  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const toRad = (value: number): number => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to mark attendance.');
        return;
      }

      setLocationGranted(true);

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const distance = getDistanceFromLatLonInMeters(
        latitude,
        longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );

      // You can customize this threshold (100 meters here)
      if (distance <= 100) {
        setIsAtOffice(true);
      } else {
        setIsAtOffice(false);
      }
    })();
  }, [officeLocation.latitude, officeLocation.longitude]);

  const handleMarkAttendance = () => {
    if (isMarked) {
      Alert.alert('Already Marked', 'You have already marked your attendance for today.');
      return;
    }

    Alert.alert('Mark Attendance', 'Are you sure you want to mark your attendance?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark',
        onPress: () => {
          setIsMarked(true);
          Alert.alert('Success', 'Attendance marked successfully!');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <View style={styles.mainContent}>
        <MapView
          style={styles.map}
          initialRegion={officeLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={false}
        >
          <Marker
            coordinate={{
              latitude: officeLocation.latitude,
              longitude: officeLocation.longitude,
            }}
            title="Office Location"
            description="Your workplace"
            pinColor="red"
          />
        </MapView>
      </View>

      <View style={styles.attendanceSection}>
        <Text style={styles.attendanceStatus}>
          {isMarked ? 'Attendance Marked' : isAtOffice ? 'You are at the office' : 'Not at office'}
        </Text>
        <Text style={styles.attendanceSubtext}>MARK Attendance</Text>

        <TouchableOpacity
          style={[
            styles.markButton,
            (isMarked || !isAtOffice) && styles.markButtonDisabled,
          ]}
          onPress={handleMarkAttendance}
          disabled={isMarked || !isAtOffice}
        >
          <Text
            style={[
              styles.markButtonText,
              (isMarked || !isAtOffice) && styles.markButtonTextDisabled,
            ]}
          >
            {isMarked ? 'MARKED' : 'MARK'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
    overflow: 'hidden',
  },
  map: {
    flex: 1,
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  markButtonDisabled: {
    backgroundColor: '#8888',
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

export const options = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 300,
}