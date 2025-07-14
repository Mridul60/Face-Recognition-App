import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Alert,
    Dimensions,
    StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeButton from 'rn-swipe-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

// Custom Hooks and Utils
import { useDateTime } from '../hooks/useDateTime';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { calculateWorkHours } from '../utils/calculateWorkHours';
import { getPunchInAndOutTime } from '@/app/services/attendanceServices';
import { handleMarkYourAttendance } from '@/app/viewmodels/dashboard-viewmodel';

// Modular Components
import MapSection from '../Components/MapSection';
import TimeSummary from '../Components/TimeSummary';

// Constants
import { installWebGeolocationPolyfill } from 'expo-location';
installWebGeolocationPolyfill();

const { width } = Dimensions.get('window');

const Dashboard = () => {
    const mapRef = useRef<MapView>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [bothIsPunched, setBothIsPunched] = useState(false);
    const [punchInTime, setPunchInTime] = useState('--:--');
    const [punchOutTime, setPunchOutTime] = useState('--:--');
    const [isLoading, setIsLoading] = useState(false);
    const [isWithinOffice, setIsWithinOffice] = useState(false);
    const [totalWorkHours, setTotalWorkHours] = useState('--:--:--');
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    const { currentDate, currentTime } = useDateTime();

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
    const { getCurrentLocation } = useCurrentLocation(
        officeLocation,
        officeRadius,
        setIsWithinOffice,
        setCurrentLocation
    );

    //     const {getCurrentLocation} = useCurrentLocation(
//         officeLocation,
//         officeRadius,
//         setIsWithinOffice,
//         setCurrentLocation
//     );
    const { handleBiometricAuth } = useBiometricAuth(isPunchedIn, isWithinOffice);

    const buttonWidth = width - 40;
    const maxTranslation = buttonWidth - 60;

    useFocusEffect(
        useCallback(() => {
            const loadBiometricPreference = async () => {
                const value = await AsyncStorage.getItem('biometricEnabled');
                setBiometricEnabled(value === 'true');
            };
            loadBiometricPreference();
        }, [])
    );

    useEffect(() => {
        const init = async () => {
            try {
                await Promise.all([
                    getPunchInAndOutTime(setPunchInTime, setPunchOutTime, setIsPunchedIn, setBothIsPunched),
                    getCurrentLocation(),
                ]);
            } catch (e) {
                console.error(e);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (isPunchedIn && punchInTime !== '--:--' && punchOutTime === '--:--') {
            if (timerRef.current) clearInterval(timerRef.current);
            const inDate = new Date(`2000-01-01T${punchInTime}`);

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
                const result = calculateWorkHours(punchInTime, punchOutTime);
                setTotalWorkHours(result);
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPunchedIn, punchInTime, punchOutTime]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#374151" />

                {/* Map Section */}
                <MapSection
                    mapRef={mapRef}
                    currentLocation={currentLocation}
                    officeLocation={officeLocation}
                    officeRadius={officeRadius}
                    styles={styles}
                />
                <View style={styles.datetext}>
                    <Text style={styles.datemonth}>{currentDate}</Text>
                    <Text style={styles.datenow}>{currentTime}</Text>
                </View>

                {/* Swipe Button */}
                <View style={styles.punchSection}>
                    <View
                        style={[
                            styles.swipeContainer,
                            !isWithinOffice && styles.swipeButtonDisabled,
                            { width: buttonWidth },
                        ]}
                    >
                        <SwipeButton
                            disabled={!isWithinOffice || isLoading || bothIsPunched}
                            swipeSuccessThreshold={60}
                            railBackgroundColor={isPunchedIn ? '#fff' : '#233138'}
                            railBorderColor="transparent"
                            railFillBackgroundColor={!isPunchedIn ? '#0C924B' : '#fff'}
                            thumbIconBackgroundColor="transparent"
                            thumbIconComponent={() => (
                                <View
                                    style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 30,
                                        backgroundColor: isPunchedIn ? '#1c1c1c' : '#0C924B',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 2,
                                        borderColor: '#0C924B',
                                    }}
                                >
                                    <Icon
                                        name="fingerprint"
                                        size={28}
                                        color={isPunchedIn ? '#0C924B' : '#fff'}
                                    />
                                </View>
                            )}
                            title={
                                isLoading
                                    ? 'Processing...'
                                    : bothIsPunched
                                        ? 'Already marked both attendance'
                                        : isPunchedIn
                                            ? 'Swipe to PUNCH-OUT'
                                            : 'Swipe to PUNCH-IN'
                            }
                            titleStyles={{
                                fontSize: 13,
                                fontWeight: '600',
                            }}
                            titleColor={isPunchedIn ? '#0C924B' : '#fff'}
                            shouldResetAfterSuccess={true}
                            onSwipeSuccess={async () => {
                                try {
                                    if (biometricEnabled) {
                                        const authSuccess = await handleBiometricAuth();
                                        if (!authSuccess) {
                                            Alert.alert('Authentication failed');
                                            return;
                                        }
                                    }
                                    handleMarkYourAttendance(isPunchedIn);
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                } catch (error) {
                                    console.error("Biometric check error:", error);
                                    Alert.alert('Error', 'Something went wrong during biometric check.');
                                }
                            }}
                            containerStyles={{
                                borderWidth: 1,
                                borderColor: isPunchedIn ? '#0C924B' : 'transparent',
                                borderRadius: 46,
                                backgroundColor: 'red',
                                height: 56,
                            }}
                        />
                    </View>

                    {/* Time Summary */}
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
    // keep your full original styles here unchanged
    container: { flex: 1, backgroundColor: '#fff' },
    mapWrapper: { flex: 1, marginBottom: 200, overflow: 'hidden', borderRadius: 20 },
    map: { flex: 1 },
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    datemonth: { fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
    datenow: { fontSize: 14, color: '#333', fontWeight: '600' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
        gap: 8,
        minHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
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
    swipeButtonDisabled: { backgroundColor: '#9CA3AF' },
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between' },
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
});

export default Dashboard;