// React and React Native imports
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StatusBar,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';

// Map-related components
import MapView, { Marker, Circle } from 'react-native-maps';

// Location API
import {
    installWebGeolocationPolyfill,
    requestForegroundPermissionsAsync,
    getCurrentPositionAsync,
    Accuracy,
} from 'expo-location';

// Storage and utilities
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';

// Custom hooks and services
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { checkPunchStatus } from '../hooks/usePunchStatus';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { submitPunch } from '../services/attendanceServices';

// Enable geolocation support in web builds
installWebGeolocationPolyfill();

const { width, height } = Dimensions.get('window');

const Dashboard = () => {
    const mapRef = useRef<MapView>(null); // Reference to the MapView

    // Type for storing location info
    type LocationType = {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null;

    // Component states
    const [currentLocation, setCurrentLocation] = useState<LocationType>(null);
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastPunchTime, setLastPunchTime] = useState<string | null>(null);
    const [isWithinOffice, setIsWithinOffice] = useState(false);

    // Office geofence location and radius
    const officeLocation = {
        latitude: 26.138415478242372,
        longitude: 91.80020770491883,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };
    const officeRadius = 100;

    // Initial effect to get location and previous punch status
    useEffect(() => {
        const init = async () => {
            try {
                await getCurrentLocation();
                await checkPunchStatus(setIsPunchedIn, setLastPunchTime);
            } catch (e) {
                console.error(e);
            }
        };
        init();
    }, []);

    // Hook to handle location tracking
    const { getCurrentLocation } = useCurrentLocation(
        officeLocation,
        officeRadius,
        setIsWithinOffice,
        setCurrentLocation
    );

    // Handle punch in/out action with backend call
    const handlePunchAction = async () => {
        setIsLoading(true);
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // e.g., 2025-07-01
        const time = now.toTimeString().split(' ')[0]; // e.g., 13:45:00

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error("User ID not found in storage");

            const newStatus = !isPunchedIn;

            // Update UI and AsyncStorage
            setIsPunchedIn(newStatus);
            setLastPunchTime(time);
            await AsyncStorage.setItem('punchStatus', JSON.stringify(newStatus));
            await AsyncStorage.setItem('lastPunchTime', time);

            // Prepare request body
            const body: any = {
                employeeID: userId,
                date,
            };
            if (newStatus) {
                body.punch_in_time = time;
            } else {
                body.punch_out_time = time;
            }

            // Send punch data to backend
            const response = await fetch('http://192.168.195.5:9000/attendance/punch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();
            console.log('Attendance response:', result);

            Alert.alert('Success', `Punched ${newStatus ? 'In' : 'Out'} at ${now.toLocaleTimeString()}`);
        } catch (e) {
            console.error('Error during punch:', e);
            Alert.alert('Error', 'Could not punch attendance.');
        } finally {
            setIsLoading(false);
        }
    };

    // Hook to trigger biometric authentication before punching
    const { handleBiometricAuth } = useBiometricAuth(
        isPunchedIn,
        isWithinOffice,
        handlePunchAction
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Top status bar */}
            <StatusBar barStyle="light-content" backgroundColor="#374151" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <View style={styles.headerRight}>
                    <Icon name='history' size={24} color="#fff" />
                </View>
            </View>

            {/* Map showing current location and office */}
            <View style={styles.mapContainer}>
                {currentLocation ? (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={currentLocation}
                        showsUserLocation
                        onMapReady={() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion(
                                    {
                                        ...currentLocation,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    },
                                    800
                                );
                            }
                        }}
                    >
                        <Marker coordinate={officeLocation} pinColor="red" title="Office" />
                        <Circle
                            center={officeLocation}
                            radius={officeRadius}
                            strokeColor="#3B82F6"
                            fillColor="rgba(59,130,246,0.1)"
                        />
                        <Marker coordinate={currentLocation} pinColor="blue" title="You" />
                    </MapView>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text>Loading map...</Text>
                    </View>
                )}

                {/* Office Info */}
                <View style={styles.officeCard}>
                    <Text style={styles.officeLabel}>Geekworkx Office</Text>
                    <TouchableOpacity onPress={() => {
                        if (mapRef.current) {
                            mapRef.current.animateToRegion(officeLocation, 800);
                        }
                    }}>
                        <Text style={styles.officeName}>Good Morning</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Punch Button Section */}
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
                        <Icon name="fingerprint" size={28} color={isPunchedIn ? '#0xF4CE14' : "#fff"} />
                    )}
                </TouchableOpacity>
                <Text style={styles.fingerprintText}>PUNCH {isPunchedIn ? 'OUT' : 'IN'}</Text>
                <Text style={styles.timestampText}>
                    Last: {lastPunchTime ? new Date(lastPunchTime).toLocaleString() : 'None'}
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default Dashboard;
