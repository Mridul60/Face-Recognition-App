import React, { useState, useEffect,useRef } from 'react';
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
import MapView, { Marker, Circle,MapViewProps } from 'react-native-maps';
import 'expo-location';
import {
  installWebGeolocationPolyfill,
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  Accuracy,
} from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

installWebGeolocationPolyfill();
const { width, height } = Dimensions.get('window');

const Dashboard = () => {
  const mapRef = useRef<MapView>(null);
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

  const officeLocation = {
    latitude: 26.138415478242372,
    longitude: 91.80020770491883,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const officeRadius = 200;

  useEffect(() => {
    const init = async () => {
      try {
        await getCurrentLocation();
        await checkPunchStatus();
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

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
  };

  const checkIfWithinOffice = (lat: number, lng: number) => {
    const R = 6371e3;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(officeLocation.latitude - lat);
    const dLon = toRad(officeLocation.longitude - lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) *
        Math.cos(toRad(officeLocation.latitude)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    setIsWithinOffice(distance <= officeRadius);
  };

  const checkPunchStatus = async () => {
    const punchStatus = await AsyncStorage.getItem('punchStatus');
    const punchTime = await AsyncStorage.getItem('lastPunchTime');
    if (punchStatus) setIsPunchedIn(JSON.parse(punchStatus));
    if (punchTime) setLastPunchTime(punchTime);
  };

  const handleBiometricAuth = async () => {
    if (!isWithinOffice) {
      Alert.alert('Location Error', 'You are outside the office boundary.');
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return Alert.alert('Unavailable', 'Biometric auth not available.');
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
    const now = new Date();
    const timeString = now.toISOString(); // Use ISO string for reliability
  
    try {
      const newStatus = !isPunchedIn;
  
      setIsPunchedIn(newStatus);
      setLastPunchTime(timeString);
  
      await AsyncStorage.setItem('punchStatus', JSON.stringify(newStatus));
      await AsyncStorage.setItem('lastPunchTime', timeString);
  
      console.log('Saved punch time:', timeString);
  
      Alert.alert('Success', `Punched ${newStatus ? 'In' : 'Out'} at ${new Date(timeString).toLocaleString()}`);
    } catch (e) {
      console.error('Error saving punch:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#374151" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerRight}>
          <Icon name='history' size={24} color="#fff" />
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView ref={mapRef} style={styles.map} initialRegion={currentLocation} showsUserLocation onMapReady={() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                ...currentLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }, 800); // 800ms animation
            }
          }}>
            <Marker coordinate={officeLocation} pinColor="red" title="Office" />
            <Circle center={officeLocation} radius={officeRadius} strokeColor="#3B82F6" fillColor="rgba(59,130,246,0.1)" />
            <Marker coordinate={currentLocation} pinColor="blue" title="You" />
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text>Loading map...</Text>
          </View>
        )}
        {/* Info Card */}
        <View style={styles.officeCard}>
                <Text style={styles.officeLabel}>Geekworkz Office</Text>
                <TouchableOpacity onPress={() => {
                  if (mapRef.current) {
                    mapRef.current.animateToRegion(officeLocation, 800); // 800ms animation
                  }
                }}>
                  <Text style={styles.officeName}>Good Morning</Text>
                </TouchableOpacity>
        </View> 


      </View>

      {/* Punch Section */}
      <View style={styles.punchSection}>
      <TouchableOpacity
          style={[
            styles.fingerprintCircle,
            isPunchedIn && styles.punchedIn,
            !isWithinOffice && styles.punchButtonDisabled
          ]}
          onPress={handleBiometricAuth}
          disabled={!isWithinOffice || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="fingerprint" size={28} color={isPunchedIn ? '#0xF4CE14':"#fff"} />
          )}
        </TouchableOpacity>
        <Text style={styles.fingerprintText}>PUNCH {isPunchedIn ? 'OUT' : 'IN'}</Text>
        <Text style={styles.timestampText}>
          Last: {lastPunchTime ? new Date(lastPunchTime).toLocaleString() : 'None'}
        </Text>
      </View>

      {/* Footer
      <View style={styles.screenSizeFooter}>
        <Text style={styles.screenSizeText}>{`${width} × ${height}`}</Text>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#2F3E46',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, color: '#fff', fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeIcon: { color: '#fff', fontSize: 12, fontFamily: 'monospace', marginLeft: 4 },

  mapContainer: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  officeCard: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  officeLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  officeName: { fontSize: 14, color: '#333', fontWeight: '600' },

  punchSection: {
    backgroundColor: '#F3F4F6',
    flex: 0.3,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  punchedIn: {
    backgroundColor: '#F4CE14', 
  },  
  fingerprintCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#354F52',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fingerprintText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  timestampText: { fontSize: 12, color: '#6B7280' },
  punchButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  screenSizeFooter: {
    backgroundColor: '#3B82F6',
    paddingVertical: 4,
    alignItems: 'center',
  },
  screenSizeText: { color: '#fff', fontSize: 12, fontFamily: 'monospace' },
});

export default Dashboard;
