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
    StyleSheet,
    Animated
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

// Additional dependencies
import AttendanceHistoryModal from './history'; // Adjust path as needed
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { savePunchToHistory } from '../utils/attendanceUtils';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { checkPunchStatus } from '../hooks/usePunchStatus';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { submitPunch } from '../services/attendanceServices';
import config from "../../config"
import { Gesture, GestureHandlerRootView, PanGestureHandlerGestureEvent,PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { GestureStateChangeEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import SwipeButton from 'rn-swipe-button';
import { IconSymbol } from '@/components/ui/IconSymbol';


installWebGeolocationPolyfill();

const { width, height } = Dimensions.get('window');

const Dashboard = () => {
    const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
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
    const [inTime, setInTime] = useState<string | null>(null);
    const [outTime, setOutTime] = useState<string | null>(null);
    const [totalWorkHours, setTotalWorkHours] = useState<string>("--:--:--");


     // Swipe animation values
     const translateX = useRef(new Animated.Value(0)).current;
     const swipeThreshold = width * 0.6; // 60% of screen width to trigger
     const buttonWidth = width - 40; // Account for horizontal padding
    // geekworkx office
    const officeLocation = {
        latitude: 26.138415478242372,
        longitude: 91.80020770491883,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    // //faruk's home (testing)
    // const officeLocation = {
    //     latitude: 26.284063268177682,
    //     longitude: 91.0827647184976,
    //     latitudeDelta: 0.01,
    //     longitudeDelta: 0.01,
    // };

    // const officeRadius = 500; // for bigger radius (for testing)
    const officeRadius = 100; // for bigger radius (for testing)

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

    const { getCurrentLocation } = useCurrentLocation(
        officeLocation,
        officeRadius,
        setIsWithinOffice,
        setCurrentLocation
    );

    const loadTodaysAttendance = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const storedInTime = await AsyncStorage.getItem(`inTime_${today}`);
            const storedOutTime = await AsyncStorage.getItem(`outTime_${today}`);
            
            if (storedInTime) setInTime(storedInTime);
            if (storedOutTime) setOutTime(storedOutTime);
            
            if (storedInTime && storedOutTime) {
                calculateWorkHours(storedInTime, storedOutTime);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    };

    const calculateWorkHours = (inTime: string, outTime: string) => {
        const inDate = new Date(`2000-01-01T${inTime}`);
        const outDate = new Date(`2000-01-01T${outTime}`);
        const diffMs = outDate.getTime() - inDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        setTotalWorkHours(`${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`);
    };

      
    const handlePunchAction = async () => {
        setIsLoading(true);
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error("User ID not found in storage");

            const newStatus = !isPunchedIn;
            setIsPunchedIn(newStatus);
            setLastPunchTime(time);

             // Store times for today
            if (newStatus) {
                setInTime(time);
                await AsyncStorage.setItem(`inTime_${date}`, time);
            } else {
                setOutTime(time);
                await AsyncStorage.setItem(`outTime_${date}`, time);
                if (inTime) {
                    calculateWorkHours(inTime, time);
                }
            }
            
            await AsyncStorage.setItem('punchStatus', JSON.stringify(newStatus));
            await AsyncStorage.setItem('lastPunchTime', time);
            await savePunchToHistory(newStatus ? 'in' : 'out', now.toISOString());

            const body: any = {
                employeeID: userId,
                date,
                ...(newStatus ? { punch_in_time: time } : { punch_out_time: time })
            };

            const response = await fetch(config.API.ATTENDANCE_PUNCH, {
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

    const { handleBiometricAuth } = useBiometricAuth(
        isPunchedIn,
        isWithinOffice,
        handlePunchAction
    );
    
      
    


      const maxTranslation = buttonWidth - 60;

      const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        {
          useNativeDriver: false,
          listener: (event: PanGestureHandlerGestureEvent) => {
            const rawX = event.nativeEvent.translationX;
            // Prevent wrong direction swipe
            if (isPunchedIn && rawX > 0) return;  // No right swipe if punched in
            if (!isPunchedIn && rawX < 0) return; // No left swipe if not punched in
            const clampedX = Math.max(-maxTranslation, Math.min(rawX, maxTranslation));
            translateX.setValue(clampedX);
          },
        }
      );
      
      
    // Handle swipe gesture state changes


    const onHandlerStateChange = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
        const { state, translationX } = nativeEvent;
      
        if (state !== State.END || isLoading || !isWithinOffice) return;
      
        const swipedRight = translationX > swipeThreshold;
        const swipedLeft = translationX < -swipeThreshold;
      
        const shouldPunchIn = !isPunchedIn && swipedRight;
        const shouldPunchOut = isPunchedIn && swipedLeft;
      
        if (shouldPunchIn || shouldPunchOut) {
          const targetX = shouldPunchIn ? maxTranslation : -maxTranslation;
      
          Animated.timing(translateX, {
            toValue: targetX,
            duration: 200,
            useNativeDriver: false,
          }).start(async () => {
            await handleBiometricAuth();
            translateX.setValue(0); // Reset after punch
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          });
        } else {
          // Snap back if not swiped enough
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      };
      
      
           
    
    const getCurrentDate = () => {
        const now = new Date();
        const options = { 
            weekday: 'long' as const,
            year: 'numeric' as const,
            month: 'long' as const,
            day: 'numeric' as const
        };
        return now.toLocaleDateString('en-US', options);
    };

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#374151" />  
            <View style={styles.mapWrapper}>
                {currentLocation ? (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={currentLocation}
                        showsUserLocation
                        onMapReady={() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    ...currentLocation,
                                    latitudeDelta: 0.001,
                                    longitudeDelta: 0.001,
                                }, 800);
                            }
                        }}
                    >
                        <Marker coordinate={officeLocation} pinColor="#0c924b" title="Office" />
                        <Circle center={officeLocation} radius={officeRadius} strokeColor="#3B82F6" fillColor="rgba(59,130,246,0.1)" />
                        <Marker coordinate={currentLocation} pinColor="red" title="You" />
                    </MapView>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text>Loading map...</Text>
                    </View>
                )}

                    <View style={styles.datetext}>
                        <Text style={styles.datemonth}>{getCurrentDate()}</Text>
                        <Text style={styles.datenow}>{getCurrentTime()}</Text>
                    </View>
                </View>
                <View style={styles.punchSection}>
                {/* Swipe Button */}
            <View
                style={[
                    styles.swipeContainer,
                    !isWithinOffice && styles.swipeButtonDisabled,
                    { width: buttonWidth },
                ]}
                >
                 <SwipeButton
                    disabled={!isWithinOffice || isLoading}
                    swipeSuccessThreshold={70}
                    railBackgroundColor={isPunchedIn ? '#fff' : '#233138'}
                    railBorderColor="transparent" // Remove visual border clash
                    railFillBackgroundColor={isPunchedIn ? '#0C924B' : '#fff'}
                    thumbIconBackgroundColor="transparent" // handled manually inside thumbIconComponent
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
                    title={isLoading ? 'Processing...' : isPunchedIn ? 'Swipe to PUNCH-OUT' : 'Swipe to PUNCH-IN'}
                    titleStyles={{
                        fontSize: 13,
                        fontWeight: '600',
                    }}
                    titleColor={isPunchedIn ? '#0C924B' : '#fff'}
                    shouldResetAfterSuccess={true}
                    onSwipeSuccess={async () => {
                        await handleBiometricAuth();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    containerStyles={{
                        borderWidth: 1, // <— THIS controls border thickness
                        borderColor: isPunchedIn ? '#0C924B' : 'transparent',
                        borderRadius: 46,
                        backgroundColor: 'red',
                        height: 56,
                      }}
                    
                    />

                </View>



                {/* Time Stats */}
                <View style={styles.timecontainer}>
                    <View style={styles.topRow}>
                        <View style={[styles.timebox, { borderRightWidth: 1 }]}>
                        <View style={styles.row}>
                            <IconSymbol name = "intime" size = {16} color = "#1c1c1c" />
                            <Text style={styles.label}> IN-TIME</Text>
                        </View>
                        <Text style={styles.timeText}>{inTime||"--:--:--"}</Text>
                        </View>
                        <View style={styles.timebox}>
                        <View style={styles.row}>
                            <IconSymbol name="outtime" size={16} color="#1C1C1E" />
                            <Text style={styles.label}> OUT-TIME</Text>
                        </View>
                        <Text style={styles.timeText}>{outTime||"--:--:--"}</Text>
                        </View>
                    </View>
                    <View style={styles.totalBox}>
                        <Text style={styles.label}>TOTAL WORK-HOUR</Text>
                        <Text style={styles.timeText}>{totalWorkHours}</Text>
                    </View>
                </View>           
            </View>
        </SafeAreaView>
    </GestureHandlerRootView>
    );
};
const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    header: {
        backgroundColor: '#2F3E46',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {fontSize: 18, color: '#fff', fontWeight: '600'},
    headerRight: {flexDirection: 'row', alignItems: 'center', gap: 6},
    codeIcon: {color: '#fff', fontSize: 12, fontFamily: 'monospace', marginLeft: 4},
   
    dateText: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    timeText: {
        fontSize: 16,
        color: '#1c1c1c',
        fontWeight: '800',
        marginTop: 2,
        alignContent: 'center',
        textAlign: 'center',
    },
    mapWrapper: {
        flex: 1,
        marginBottom: 200,
        overflow: 'hidden',
        borderRadius: 20,
      },
    mapContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Map takes full screen
    },
    map:{flex:1,overflow: 'hidden'},
    loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

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

    punchSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(243, 244, 246, 0.95)', // Semi-transparent
        borderTopLeftRadius: 45,
        borderTopRightRadius: 45,
        paddingVertical: 40,
        alignItems: 'center',
        gap: 8,
        minHeight: 200,
        // Add subtle shadow
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
   
    timestampText: {fontSize: 12, color: '#6B7280'},
    punchButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },

    screenSizeFooter: {
        backgroundColor: '#3B82F6',
        paddingVertical: 4,
        alignItems: 'center',
    },
    screenSizeText: {color: '#fff', fontSize: 12, fontFamily: 'monospace'},
    historyButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    bottomSection: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 20,
        paddingVertical: 25,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    swipeContainer: {
        height: 52,
        borderRadius: 30,
        marginBottom: 20,
        justifyContent: 'center',
        backgroundColor: 'transparent', // prevents bleed
      },
      
      
   
  
  
 
    swipeButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
   
      
      
      
    timecontainer: {
        backgroundColor: '#cad2c5',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        
        padding: 16,
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
        elevation: 4, // Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    topRow:{
    
        flexDirection: 'row',
        justifyContent: 'space-between',   
    },
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

});


export default Dashboard;
