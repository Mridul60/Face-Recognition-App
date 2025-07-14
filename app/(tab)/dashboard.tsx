import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Alert,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import MapView from 'react-native-maps';
import {useFocusEffect} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import SwipeButton from 'rn-swipe-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import {useDateTime} from '../hooks/useDateTime';
import {useCurrentLocation} from '../hooks/useCurrentLocation';
import {useBiometricAuth} from '../hooks/useBiometricAuth';
import {calculateWorkHours} from '../utils/calculateWorkHours';
import {getPunchInAndOutTime} from '@/app/services/attendanceServices';
import {handleMarkYourAttendance} from '@/app/viewmodels/dashboard-viewmodel';

import MapSection from '../Components/MapSection';
import TimeSummary from '../Components/TimeSummary';

import {installWebGeolocationPolyfill} from 'expo-location';

installWebGeolocationPolyfill();

const {width} = Dimensions.get('window');

const Dashboard = () => {
    const mapRef = useRef<MapView>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const locationMonitorRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [bothIsPunched, setBothIsPunched] = useState(false);
    const [punchInTime, setPunchInTime] = useState('--:--');
    const [punchOutTime, setPunchOutTime] = useState('--:--');
    const [isLoading, setIsLoading] = useState(false);
    const [isWithinOffice, setIsWithinOffice] = useState(false);
    const [totalWorkHours, setTotalWorkHours] = useState('--:--:--');
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    // Separate loading states
    const [isMapLoading, setIsMapLoading] = useState(false); // No longer needed for cached location
    const [isLocationLoading, setIsLocationLoading] = useState(true);
    const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);

    // New state for real-time location verification
    const [lastLocationUpdate, setLastLocationUpdate] = useState<number | null>(null);
    const [isLocationFresh, setIsLocationFresh] = useState(false);
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

    const {currentDate, currentTime} = useDateTime();

    const officeLocation = {
        latitude: 26.138415478242372,
        longitude: 91.80020770491883,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    const officeRadius = 10000;

    type LocationType = {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null;

    const [currentLocation, setCurrentLocation] = useState<LocationType>(null);
    const [displayLocation, setDisplayLocation] = useState<LocationType>(null); // For map display

    const {getCurrentLocation} = useCurrentLocation(
        officeLocation,
        officeRadius,
        setIsWithinOffice,
        setCurrentLocation
    );

    const {handleBiometricAuth} = useBiometricAuth(isPunchedIn, isWithinOffice);

    const buttonWidth = width - 40;

    // Load cached location immediately for map display (no security decisions)
    useEffect(() => {
        const loadCachedLocationForDisplay = async () => {
            try {
                console.log('[INFO] Loading cached location for map display...');
                const cached = await AsyncStorage.getItem('cachedLocation');
                if (cached) {
                    const cachedLocation = JSON.parse(cached);
                    setDisplayLocation(cachedLocation);
                    console.log('[SUCCESS] Cached location loaded for display');
                } else {
                    // Default to office location if no cache
                    setDisplayLocation(officeLocation);
                    console.log('[INFO] No cached location, using office location');
                }
            } catch (e) {
                console.error('[ERROR] Failed to load cached location:', e);
                setDisplayLocation(officeLocation);
            }
        };
        loadCachedLocationForDisplay();
    }, []);

    // Battery-efficient location monitoring with smart strategies
    useEffect(() => {
        const startLocationMonitoring = async () => {
            try {
                console.log('[INFO] Starting location monitoring...');

                // Initial location fetch
                await getCurrentLocation();
                setLastLocationUpdate(Date.now());
                setIsLocationFresh(true);
                setIsLocationLoading(false);

                // Smart location monitoring strategy
                const startSmartMonitoring = () => {
                    // Strategy 1: Adaptive intervals based on movement
                    let currentInterval = 120000; // Start with 2 minutes
                    const maxInterval = 300000; // Max 5 minutes
                    const minInterval = 60000; // Min 1 minute

                    const scheduleNextUpdate = () => {
                        locationMonitorRef.current = setTimeout(async () => {
                            try {
                                const previousLocation = currentLocation;
                                await getCurrentLocation();
                                setLastLocationUpdate(Date.now());
                                setIsLocationFresh(true);

                                // Check if user moved significantly
                                if (previousLocation && currentLocation) {
                                    const distance = calculateDistance(
                                        previousLocation.latitude,
                                        previousLocation.longitude,
                                        currentLocation.latitude,
                                        currentLocation.longitude
                                    );

                                    // If user moved > 100m, check more frequently
                                    if (distance > 100) {
                                        currentInterval = minInterval;
                                        console.log('[INFO] Movement detected, increasing frequency');
                                    } else {
                                        // If stationary, reduce frequency
                                        currentInterval = Math.min(currentInterval * 1.5, maxInterval);
                                        console.log('[INFO] Stationary, reducing frequency');
                                    }
                                }

                                console.log(`[INFO] Next location check in ${currentInterval / 1000}s`);
                                scheduleNextUpdate();

                            } catch (error) {
                                console.error('[ERROR] Location monitoring failed:', error);
                                setIsLocationFresh(false);
                                // Retry with longer interval on error
                                currentInterval = Math.min(currentInterval * 2, maxInterval);
                                scheduleNextUpdate();
                            }
                        }, currentInterval);
                    };

                    scheduleNextUpdate();
                };

                startSmartMonitoring();

            } catch (error) {
                console.error('[ERROR] Initial location fetch failed:', error);
                setIsLocationLoading(false);
                setIsLocationFresh(false);
            }
        };

        startLocationMonitoring();

        return () => {
            if (locationMonitorRef.current) {
                clearTimeout(locationMonitorRef.current);
            }
        };
    }, []);

    // Helper function to calculate distance between two points
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    // Update display location when real location changes
    useEffect(() => {
        if (currentLocation) {
            setDisplayLocation(currentLocation);
            // Cache the new location
            AsyncStorage.setItem('cachedLocation', JSON.stringify(currentLocation));
        }
    }, [currentLocation]);

    // Check location freshness with longer tolerance
    useEffect(() => {
        const checkLocationFreshness = () => {
            if (lastLocationUpdate) {
                const isStale = (Date.now() - lastLocationUpdate) > 600000; // 10 minutes tolerance
                setIsLocationFresh(!isStale);
            }
        };

        const freshnessInterval = setInterval(checkLocationFreshness, 30000); // Check every 30 seconds
        return () => clearInterval(freshnessInterval);
    }, [lastLocationUpdate]);

    // Biometric preference loading
    useFocusEffect(
        useCallback(() => {
            const loadBiometricPreference = async () => {
                const value = await AsyncStorage.getItem('biometricEnabled');
                console.log('[INFO] Biometric preference loaded:', value);
                setBiometricEnabled(value === 'true');
            };
            loadBiometricPreference();
        }, [])
    );

    // Load attendance data
    useEffect(() => {
        const loadAttendanceData = async () => {
            try {
                console.log('[INFO] Fetching attendance data...');
                setIsAttendanceLoading(true);
                await getPunchInAndOutTime(setPunchInTime, setPunchOutTime, setIsPunchedIn, setBothIsPunched);
                console.log('[SUCCESS] Attendance data loaded');
            } catch (e) {
                console.error('[ERROR] Attendance loading failed:', e);
            } finally {
                setIsAttendanceLoading(false);
            }
        };

        loadAttendanceData();
    }, []);

    // Work hours calculation
    useEffect(() => {
        if (isPunchedIn && punchInTime !== '--:--' && punchOutTime === '--:--') {
            console.log('[TIMER] Starting real-time timer...');
            const inDate = new Date(`2000-01-01T${punchInTime}`);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                const now = new Date();
                const current = new Date(`2000-01-01T${now.toTimeString().split(' ')[0]}`);
                let diffMs = current.getTime() - inDate.getTime();
                if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

                const h = Math.floor(diffMs / (1000 * 60 * 60));
                const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diffMs % (1000 * 60)) / 1000);

                const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                setTotalWorkHours(formatted);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (punchInTime !== '--:--' && punchOutTime !== '--:--') {
                console.log('[TIMER] Calculating total work hours statically');
                const result = calculateWorkHours(punchInTime, punchOutTime);
                setTotalWorkHours(result);
            }
        }

        return () => {
            if (timerRef.current) {
                console.log('[TIMER] Cleaning up interval');
                clearInterval(timerRef.current);
            }
        };
    }, [isPunchedIn, punchInTime, punchOutTime]);

    // Enhanced punch verification with on-demand location check
    const handlePunchAction = async () => {
        try {
            console.log('[ACTION] Punch action initiated');
            setIsLoading(true);

            // Strategy: Check location freshness first, then decide
            const timeSinceLastUpdate = lastLocationUpdate ? Date.now() - lastLocationUpdate : Infinity;

            // If location is older than 5 minutes, get fresh location
            if (timeSinceLastUpdate > 300000) {
                console.log('[SECURITY] Location is stale, fetching fresh location...');
                await getCurrentLocation();
                setLastLocationUpdate(Date.now());
                setIsLocationFresh(true);
            }

            // Now check office proximity
            if (!isWithinOffice) {
                Alert.alert(
                    'Location Error',
                    'You must be within office premises to mark attendance. Please ensure you are at the office location.',
                    [{text: 'OK', style: 'default'}]
                );
                return;
            }

            // Additional security: Check location freshness
            if (!isLocationFresh) {
                Alert.alert(
                    'Location Error',
                    'Unable to verify your current location. Please check your GPS settings and try again.',
                    [{text: 'OK', style: 'default'}]
                );
                return;
            }

            // Biometric authentication if enabled
            if (biometricEnabled) {
                console.log('[AUTH] Biometric authentication started...');
                const authSuccess = await handleBiometricAuth();
                if (!authSuccess) {
                    console.warn('[AUTH] Biometric authentication failed');
                    Alert.alert('Authentication Failed', 'Please try again.');
                    return;
                }
            }

            // Mark attendance
            console.log('[ACTION] Marking attendance...');
            await handleMarkYourAttendance(isPunchedIn);

            // Success feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Refresh attendance data
            await getPunchInAndOutTime(setPunchInTime, setPunchOutTime, setIsPunchedIn, setBothIsPunched);

        } catch (error) {
            console.error('[ERROR] Punch action failed:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Determine button state
    const getButtonState = () => {
        if (isLoading) return 'loading';
        if (bothIsPunched) return 'completed';
        if (!isLocationFresh) return 'location_stale';
        if (!isWithinOffice) return 'outside_office';
        return 'ready';
    };

    const getButtonTitle = () => {
        const state = getButtonState();
        switch (state) {
            case 'loading':
                return 'Processing...';
            case 'completed':
                return 'Attendance completed for today';
            case 'location_stale':
                return 'Updating location...';
            case 'outside_office':
                return isPunchedIn ? 'Move to office to PUNCH-OUT' : 'Move to office to PUNCH-IN';
            case 'ready':
                return isPunchedIn ? 'Swipe to PUNCH-OUT' : 'Swipe to PUNCH-IN';
            default:
                return 'Please wait...';
        }
    };

    const isButtonDisabled = () => {
        const state = getButtonState();
        return state !== 'ready';
    };

    const renderMapSection = () => {
        return (
            <View style={styles.container}>
                <MapSection
                    mapRef={mapRef}
                    currentLocation={displayLocation} // Use display location
                    officeLocation={officeLocation}
                    officeRadius={officeRadius}
                    styles={styles}
                />
                {/* Show a subtle indicator for location freshness */}
                {/*{!isLocationFresh && (*/}
                {/*    <View style={styles.locationIndicator}>*/}
                {/*        <ActivityIndicator size="small" color="#0C924B"/>*/}
                {/*        <Text style={styles.locationIndicatorText}>Updating location...</Text>*/}
                {/*    </View>*/}
                {/*)}*/}
            </View>
        );
    };

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#374151"/>
                {renderMapSection()}

                <View style={styles.datetext}>
                    <Text style={styles.datemonth}>{currentDate}</Text>
                    <Text style={styles.datenow}>{currentTime}</Text>
                </View>

                <View style={styles.punchSection}>
                    {/*<View>*/}
                    {/*    <Text style={styles.datemonth}>{currentDate}, {currentTime}</Text>*/}
                    {/*</View>*/}
                    <View
                        style={[
                            styles.swipeContainer,
                            isButtonDisabled() && styles.swipeButtonDisabled,
                            {width: buttonWidth},
                        ]}
                    >
                        <SwipeButton
                            disabled={isButtonDisabled()}
                            swipeSuccessThreshold={70}
                            railBackgroundColor={isPunchedIn ? '#fff' : '#233138'}
                            railBorderColor="transparent"
                            railFillBackgroundColor={isPunchedIn ? '#0C924B' : '#fff'}
                            thumbIconBackgroundColor="transparent"
                            thumbIconComponent={() => (
                                <View
                                    style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 30,
                                        backgroundColor: isPunchedIn ? '#fff' : '#0C924B',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 2,
                                        borderColor: isPunchedIn ? '#0C924B' : '#0C924B',
                                    }}
                                >
                                    <Icon
                                        name="fingerprint"
                                        size={28}
                                        color={isPunchedIn ? '#0C924B' : '#fff'}
                                    />
                                </View>
                            )}
                            title={getButtonTitle()}
                            titleStyles={{
                                fontSize: 13,
                                fontWeight: '600',
                                
                            }}
                            titleColor={isPunchedIn ? '#0C924B' : '#fff'}
                            shouldResetAfterSuccess={true}
                            onSwipeSuccess={handlePunchAction}
                            containerStyles={{
                                borderWidth: 1,
                                borderColor: isPunchedIn ? '#0C924B' : 'transparent',
                                borderRadius: 46,
                                backgroundColor: 'red',
                                height: 56,
                            }}
                        />
                    </View>

                    <TimeSummary
                        punchInTime={punchInTime}
                        punchOutTime={punchOutTime}
                        totalWorkHours={totalWorkHours}
                        styles={styles}
                    />
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};
const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    mapWrapper: {
        flex: 1,
        marginBottom: 200,
        overflow: 'hidden',
        borderRadius: 20,
        position: 'relative' // Add for overlay positioning
    },
    map: {flex: 1},
    // Add new styles for loading overlay
    mapLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#0C924B',
        fontWeight: '600',
    },
    datetext: {
        position: 'absolute',
        top: 54,
        height: 56,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    datemonth: {fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: 1},
    datenow: {fontSize: 14, color: '#333', fontWeight: '600'},
    loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    punchSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(243, 244, 246, 0.95)',
        borderTopLeftRadius: 45,
        borderTopRightRadius: 45,
        paddingVertical: 40,
        alignItems: 'center',
        gap: 0,
        minHeight: 200,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    swipeContainer: {
        height: 52,
        borderRadius: 30,
        marginBottom: 20,
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    swipeButtonDisabled: {backgroundColor: 'transparent'},
    timecontainer: {
        backgroundColor: '#cad2c5',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    topRow: {flexDirection: 'row', justifyContent: 'space-between'},
    timebox: {
        borderColor: '#3E4F47',
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    totalBox: {
        borderTopWidth: 1,
        borderColor: '#3E4F47',
        paddingVertical: 16,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        fontWeight: '700',
        color: '#1C1C1E',
        fontSize: 12,
    },
    timeText: {
        fontSize: 16,
        color: '#1c1c1c',
        fontWeight: '800',
        marginTop: 2,
        alignContent: 'center',
        textAlign: 'center',
    },
    locationIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIndicatorText: {
        fontSize: 12,
        color: '#0C924B',
        marginLeft: 5,
        fontWeight: '500',
    },
});

export default Dashboard;