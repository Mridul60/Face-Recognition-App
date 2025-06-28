import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import 'expo-location';
import { installWebGeolocationPolyfill,requestBackgroundPermissionsAsync,getCurrentPositionAsync,Accuracy } from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

installWebGeolocationPolyfill();

const { width, height } = Dimensions.get('window');

const Dashboard = () => {
  type LocationType = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  
  const [currentLocation, setCurrentLocation] = useState<LocationType>(null);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPunchTime, setLastPunchTime] = useState<string | null>(null);
  const [isWithinOffice, setIsWithinOffice] = useState(false);

  // Office location coordinates (replace with actual office coordinates)
  const officeLocation = {
    latitude:26.004846542169908, 
    longitude:92.85265126568527,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const officeRadius = 100; // meters

  useEffect(() => {
    const init = async () => {
      try {
        getCurrentLocation();
        checkPunchStatus();
      }catch (error){
        console.error('Error in useEffect:',error)
      }
    };
    init()
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      return;
    }
    try{
      const location = await getCurrentPositionAsync({
        accuracy: Accuracy.Highest,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      checkIfWithinOffice(latitude, longitude);
    }catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to get current location. Please try again.');
    }
    
  };

  const checkIfWithinOffice = (lat:number, lng:number) => {
    const distance = calculateDistance(
      lat,
      lng,
      officeLocation.latitude,
      officeLocation.longitude
    );
    setIsWithinOffice(distance <= officeRadius);
  };

  const calculateDistance = (lat1:number , lon1:number, lat2:number, lon2:number) => {
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

  const checkPunchStatus = async () => {
    try {
      const punchStatus = await AsyncStorage.getItem('punchStatus');
      const lastPunch = await AsyncStorage.getItem('lastPunchTime');
      
      if (punchStatus) {
        setIsPunchedIn(JSON.parse(punchStatus));
      }
      if (lastPunch) {
        setLastPunchTime(lastPunch);
      }
    } catch (error) {
      console.log('Error checking punch status:', error);
    }
  };

  const handleBiometricAuth = async () => {
    if (!isWithinOffice) {
      Alert.alert(
        'Location Error',
        'You must be within the office premises to punch in/out'
      );
      return;
    }
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      return Alert.alert('Biometrics Unavailable', 'No biometric options available.');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Punch ${isPunchedIn ? 'Out' : 'In'}`,
      fallbackLabel: 'Use PIN',
    });
    if (result.success) handlePunchAction();
    else Alert.alert('Authentication Failed');
  };

  const handlePunchAction = async () => {
    setIsLoading(true);
    
    try {
      const now = new Date();
      const timeString = now.toLocaleString();
      
      // Toggle punch status
      const newPunchStatus = !isPunchedIn;
      setIsPunchedIn(newPunchStatus);
      setLastPunchTime(timeString);
      
      // Save to local storage
      await AsyncStorage.setItem('punchStatus', JSON.stringify(newPunchStatus));
      await AsyncStorage.setItem('lastPunchTime', timeString);
      
      // Here you would typically sync with your backend API
      // await syncWithBackend(newPunchStatus, timeString, currentLocation);
      
      Alert.alert(
        'Success',
        `Successfully punched ${newPunchStatus ? 'in' : 'out'} at ${timeString}`
      );
    } catch (error) {
      console.log('Punch action error:', error);
      Alert.alert('Error', 'Failed to record punch. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString:string) => {
    if (!timeString) return 'No record';
    return new Date(timeString).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={getCurrentLocation}>
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            style={styles.map}
            initialRegion={currentLocation}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Office Location Marker */}
            <Marker
              coordinate={{
                latitude: officeLocation.latitude,
                longitude: officeLocation.longitude,
              }}
              title="Office Location"
              description="Main Office"
              pinColor="red"
            />
            
            {/* Office Boundary Circle */}
            <Circle
              center={{
                latitude: officeLocation.latitude,
                longitude: officeLocation.longitude,
              }}
              radius={officeRadius}
              strokeColor="rgba(52, 152, 219, 0.5)"
              fillColor="rgba(52, 152, 219, 0.1)"
            />
            
            {/* Current Location Marker */}
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                title="Your Location"
                pinColor="blue"
              />
            )}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text>Loading map...</Text>
          </View>
        )}
      </View>

      {/* Status Bar */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Icon 
            name="location-on" 
            size={20} 
            color={isWithinOffice ? '#27ae60' : '#e74c3c'} 
          />
          <Text style={[
            styles.statusText,
            { color: isWithinOffice ? '#27ae60' : '#e74c3c' }
          ]}>
            {isWithinOffice ? 'Within Office' : 'Outside Office'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Icon 
            name="access-time" 
            size={20} 
            color={isPunchedIn ? '#27ae60' : '#95a5a6'} 
          />
          <Text style={[
            styles.statusText,
            { color: isPunchedIn ? '#27ae60' : '#95a5a6' }
          ]}>
            {isPunchedIn ? 'Punched In' : 'Punched Out'}
          </Text>
        </View>
      </View>

      {/* Last Punch Time */}
      {lastPunchTime && (
        <View style={styles.lastPunchContainer}>
          <Text style={styles.lastPunchLabel}>Last Action:</Text>
          <Text style={styles.lastPunchTime}>{formatTime(lastPunchTime)}</Text>
        </View>
      )}

      {/* Punch Button */}
      <View style={styles.punchContainer}>
        <TouchableOpacity
          style={[
            styles.punchButton,
            !isWithinOffice && styles.punchButtonDisabled,
            isPunchedIn && styles.punchButtonOut
          ]}
          onPress={handleBiometricAuth}
          disabled={!isWithinOffice || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Icon name="fingerprint" size={40} color="#fff" />
              <Text style={styles.punchButtonText}>
                Punch {isPunchedIn ? 'Out' : 'In'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  lastPunchContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  lastPunchLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  lastPunchTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  punchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  punchButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  punchButtonOut: {
    backgroundColor: '#e74c3c',
  },
  punchButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  punchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default Dashboard;