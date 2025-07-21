// Core imports from React and React Native
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Image,
    Platform, Animated, BackHandler
} from 'react-native';

// Animation and camera libraries
import * as Animatable from 'react-native-animatable';
import {
    useCameraDevice,
    useCameraPermission,
    Camera
} from 'react-native-vision-camera';
import MlkitFaceDetection from '@react-native-ml-kit/face-detection';
import Toast from 'react-native-toast-message';

// Custom components and assets
import OvalProgressRing from "@/app/Components/face-verification/RoundedProgressBar";
import Logo from '@/assets/icons/GEEK-Id.svg';

// Routing, config, local storage, and styles
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../../config";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles-face-verification';

const BiometricScanScreen = () => {
    // Animation for loading progress
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [progress, setProgress] = useState(0);
    const countdownAnimRef = useRef<number | null>(null);

    // Camera and permissions
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');
    const cameraRef = useRef<Camera | null>(null);

    // Face detection state
    const [faces, setFaces] = useState<any[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

    // Timers and counters
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const lastFaceCount = useRef<number>(0);

    // Countdown and detection status
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);

    // Whether face is already registered
    const [faceExists, setFaceExists] = useState<boolean | null>(null);

    // Processing status (to block UI and disable camera)
    const [isProcessing, setIsProcessing] = useState(false);

    // Safe area inset (for iOS UI spacing)
    const insets = useSafeAreaInsets();

    // Route parameter from dashboard
    const { punchInOrPunchOut } = useLocalSearchParams();

    // Status messages shown during processing
    const [dynamicStatusMessage, setDynamicStatusMessage] = useState<string | null>(null);
    const dynamicStatusMessageTimeoutRefs = useRef<number[]>([]);

    // Function to update dynamic messages step-by-step
    const startDynamicStatusMessages = (initialText: string, finalStepText: string) => {
        dynamicStatusMessageTimeoutRefs.current.forEach(clearTimeout);
        dynamicStatusMessageTimeoutRefs.current = [];

        const messages = [
            "Processing image...",
            "Uploading image...",
            "Analyzing facial features..."
        ];
        const delay = 9000 / (messages.length + 1);
        let accumulatedDelay = 0;

        setDynamicStatusMessage(initialText);

        messages.forEach(msg => {
            accumulatedDelay += delay;
            const id = setTimeout(() => setDynamicStatusMessage(msg), accumulatedDelay);
            dynamicStatusMessageTimeoutRefs.current.push(id);
        });

        const finalId = setTimeout(() => {
            setDynamicStatusMessage(finalStepText);
        }, 9000);
        dynamicStatusMessageTimeoutRefs.current.push(finalId);
    };

    // Clear all status message timeouts
    const stopDynamicStatusMessages = () => {
        dynamicStatusMessageTimeoutRefs.current.forEach(clearTimeout);
        dynamicStatusMessageTimeoutRefs.current = [];
        setDynamicStatusMessage(null);
    };

    // Progress animation interpolation (not directly used)
    const interpolatedWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    // Ref to always point to latest detectFaces function
    const detectFacesRef = useRef<() => Promise<void>>(async () => {});
    useEffect(() => {
        detectFacesRef.current = detectFaces;
    });

    // Start face detection loop
    const startDetection = useCallback(() => {
        stopDetection();
        if (!device || !hasPermission || !isCameraInitialized || faceExists === null) return;
        intervalRef.current = setInterval(() => {
            detectFacesRef.current();
        }, 800);
    }, [device, hasPermission, isCameraInitialized, faceExists]);

    // Stop face detection loop
    const stopDetection = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Start detection on mount
    useEffect(() => {
        startDetection();
        return () => stopDetection();
    }, [startDetection, stopDetection]);

    // Check if face is registered (API call)
    useEffect(() => {
        (async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User not logged in.');
                router.replace('/(auth)/login');
                return;
            }

            try {
                const res = await fetch(config.API.IS_AVAILABLE(userId));
                const data = await res.json();
                setFaceExists(data?.body?.exists === true);
            } catch (err) {
                Alert.alert('Error', 'Could not check face data.');
                router.replace('/(tab)/dashboard');
            }
        })();
    }, []);

    // Block back press while processing
    useEffect(() => {
        const onBackPress = () => isProcessing;

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        if (isProcessing) {
            progressAnim.setValue(0);
            Animated.loop(
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 9000,
                    useNativeDriver: false
                })
            ).start();
        } else {
            progressAnim.stopAnimation();
        }

        return () => subscription.remove();
    }, [isProcessing]);

    // Request camera permission on mount
    useEffect(() => {
        (async () => {
            await requestPermission();
        })();
    }, [requestPermission]);

    // Detect faces using ML Kit
    const detectFaces = async () => {
        if (!cameraRef.current || isDetecting || isProcessing) return;

        try {
            setIsDetecting(true);
            const photo = await cameraRef.current.takeSnapshot({ quality: 70 });
            const imageUri = `file://${photo.path}`;

            const result = await MlkitFaceDetection.detect(imageUri, {
                landmarkMode: 'none',
                contourMode: 'none',
                classificationMode: 'none',
                minFaceSize: 0.1,
                performanceMode: 'fast'
            });

            setFaces(result || []);
            lastFaceCount.current = result.length;

            if (result.length === 1 && !timeoutRef.current) {
                setIsCountingDown(true);
                setProgress(0);

                countdownAnimRef.current = setInterval(() => {
                    setProgress(prev => Math.min(prev + 0.05, 1));
                }, 100);

                timeoutRef.current = setTimeout(async () => {
                    clearInterval(countdownAnimRef.current!);
                    setProgress(0);
                    setIsCountingDown(false);

                    const confirmPhoto = await cameraRef.current?.takeSnapshot({ quality: 70 });
                    if (!confirmPhoto) {
                        Alert.alert('Error', 'Could not take confirmation photo.');
                        restartDetection();
                        return;
                    }

                    const confirmUri = `file://${confirmPhoto.path}`;
                    const confirmResult = await MlkitFaceDetection.detect(confirmUri, {
                        landmarkMode: 'none',
                        contourMode: 'none',
                        classificationMode: 'none',
                        minFaceSize: 0.1,
                        performanceMode: 'fast'
                    });

                    if (confirmResult.length === 1) {
                        setCapturedImageUri(confirmUri);
                        clearInterval(intervalRef.current!);
                        await handleScan(confirmResult, confirmUri);
                    } else {
                        Alert.alert('Try Again', 'Make sure your face is clearly visible.');
                        restartDetection();
                    }

                    timeoutRef.current = null;
                }, 2500);
            } else if (result.length !== 1 && timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
                clearInterval(countdownAnimRef.current!);
                countdownAnimRef.current = null;
                setProgress(0);
                setIsCountingDown(false);
            }
        } catch (error) {
            console.error('Face detection error:', error);
            Alert.alert('Camera Error', 'Detection failed. Check lighting and camera access.');
            restartDetection();
        } finally {
            setIsDetecting(false);
        }
    };

    // Upload image and handle registration or verification
    const handleScan = async (confirmedFaces: any[], imageUri: string) => {
        if (confirmedFaces.length === 0 || faceExists === null) {
            Alert.alert('Error', 'Face not detected or face state unknown.');
            restartDetection();
            return;
        }

        startDynamicStatusMessages(
            faceExists ? "Verifying face..." : "Registering face...",
            faceExists ? "Matching face..." : "Registering face..."
        );
        setIsProcessing(true);

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found.');
                router.replace('/(auth)/login');
                return;
            }

            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                name: 'face.jpg',
                type: 'image/jpg'
            } as any);

            const endpoint = faceExists
                ? config.API.FACE_MATCH(userId, punchInOrPunchOut)
                : config.API.FACE_REGISTER(userId);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            const raw = await response.text();
            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                Alert.alert('Error', 'Invalid server response.');
                stopDynamicStatusMessages();
                resetScanState();
                return;
            }

            if (response.ok) {
                setDynamicStatusMessage(faceExists ? "Verification complete." : "Registration complete.");
                stopDynamicStatusMessages();

                if (faceExists) {
                    if (data.body?.matched) {
                        Toast.show({
                            type: 'success',
                            text1: 'Success',
                            text2: data.body?.message || 'Face matched!',
                            position: 'bottom'
                        });
                        await AsyncStorage.setItem('punchStatus', punchInOrPunchOut === 'punchIn' ? 'true' : 'false');
                        router.replace('/(tab)/dashboard');
                    } else {
                        Alert.alert('Failed', data.body?.message || 'Face mismatch.', [
                            { text: 'OK', onPress: () => restartDetection() }
                        ]);
                    }
                } else {
                    if (data.body?.success) {
                        Alert.alert('Success', 'Face registered!');
                        router.replace('/(tab)/dashboard');
                    } else {
                        Alert.alert('Failed', data.body?.message || 'Registration failed.', [
                            { text: 'OK', onPress: () => restartDetection() }
                        ]);
                    }
                }
            } else {
                const errorMsg = data.body?.message || `Server error ${response.status}`;
                Alert.alert('Failed', errorMsg, [
                    { text: 'OK', onPress: () => restartDetection() }
                ]);
                stopDynamicStatusMessages();
            }
        } catch {
            Alert.alert('Failed', 'Scan failed. Try again.', [
                { text: 'OK', onPress: () => restartDetection() }
            ]);
            stopDynamicStatusMessages();
        } finally {
            setIsProcessing(false);
        }
    };

    // Restart the detection process
    const restartDetection = () => {
        resetScanState();
        startDetection();
    };

    // Reset scan state and UI
    const resetScanState = () => {
        setCapturedImageUri(null);
        setIsProcessing(false);
        progressAnim.stopAnimation();
        progressAnim.setValue(0);
        stopDynamicStatusMessages();

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;

        if (countdownAnimRef.current) clearInterval(countdownAnimRef.current);
        countdownAnimRef.current = null;

        setProgress(0);
        setIsCountingDown(false);
    };

    // Fallback UI when no camera or permission
    if (!hasPermission) {
        return (
            <View style={styles.centered}>
                <Text>No camera access</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.scanButton}>
                    <Text style={styles.scanButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No camera device found</Text>
            </View>
        );
    }

    // Main screen rendering
    return (
        <View style={styles.container}>
            <View style={[styles.header, {paddingTop: Platform.OS === 'ios' ? insets.top : 10}]}>
                <Logo width={142} height={54}/>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    {faceExists ? 'Align Your Face to Verify' : 'Align Your Face to Register'}
                </Text>

                {/* Camera View or Captured Image */}
                <View style={styles.scanArea}>
                    <View style={styles.scanAreaForCamera}>
                        {capturedImageUri ? (
                            <Image
                                source={{uri: capturedImageUri}}
                                style={[StyleSheet.absoluteFill]}
                                resizeMode="cover"
                            />
                        ) : (
                            <Camera
                                ref={cameraRef}
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={!!device && !isProcessing} // Camera active unless processing
                                photo={true}
                                onInitialized={() => setIsCameraInitialized(true)}
                            />
                        )}
                    </View>

                    {/* Other overlays */}
                    {!capturedImageUri && (
                        <Animatable.View
                            animation="pulse"
                            easing="ease-in-out"
                            iterationCount="infinite"
                            duration={1400}
                            style={[
                                styles.dottedOval,
                                {borderColor: faces.length > 0 ? '#4CAF50' : '#FF5722'}
                            ]}
                        />
                    )}

                    {isCountingDown && (
                        <View style={styles.ovalProgress}>
                            <OvalProgressRing progress={progress} width={320} height={400}/>
                        </View>
                    )}
                    <View style={styles.ovalBorder} pointerEvents="none"/>
                    {/*<View style={styles.cornerTopLeft}/>*/}
                    {/*<View style={styles.cornerTopRight}/>*/}
                    {/*<View style={styles.cornerBottomLeft}/>*/}
                    {/*<View style={styles.cornerBottomRight}/>*/}
                </View>


                {/* Instructions and status UI */}
                <View style={styles.instructionCard}>
                    <Text style={styles.instructionText}>
                        Please align your face and ensure you are in a well-lit environment.
                    </Text>

                    {/*<View style={styles.faceStatusContainer}>*/}
                    {/* <View style={[*/}
                    {/* styles.faceStatusIndicator,*/}
                    {/* { backgroundColor: faces.length > 0 ? '#4CAF50' : '#FF5722' }*/}
                    {/* ]}>*/}
                    {/* <Text style={styles.faceStatusText}>*/}
                    {/* {faces.length > 0 ? `✓ Face Detected` : '○ No Face Detected'}*/}
                    {/* </Text>*/}
                    {/* </View>*/}
                    {/*</View>*/}
                </View>

                {/* Dynamic status message */}
                {dynamicStatusMessage && (
                    <Animatable.Text
                        animation="fadeIn"
                        duration={400}
                        style={styles.statusText}
                    >
                        {dynamicStatusMessage}
                    </Animatable.Text>
                )}
            </View>
        </View>
    );
};
export default BiometricScanScreen;