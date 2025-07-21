// Core imports from React and React Native
import React, {useEffect, useRef, useState} from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Image,
    Platform, Animated, BackHandler
} from 'react-native';

// Animation and camera libraries
import * as Animatable from 'react-native-animatable';
import {
    useCameraDevice,
    useCameraPermission,
    Camera,
} from 'react-native-vision-camera';
import MlkitFaceDetection from '@react-native-ml-kit/face-detection';
import OvalProgressRing from "@/app/Components/face-verification/RoundedProgressBar";

// Routing, local storage, styles, assets, and config
import {router, useLocalSearchParams} from 'expo-router';
import styles from './styles-face-verification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../../config"
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Logo from '@/assets/icons/GEEK-Id.svg'
import Toast from 'react-native-toast-message';

// Component starts here
const BiometricScanScreen = () => {
    // Animation value for progress bar
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [progress, setProgress] = useState(0);
    const countdownAnimRef = useRef<number | null>(null);

    // Camera permissions and device setup
    const {hasPermission, requestPermission} = useCameraPermission();
    const device = useCameraDevice('front'); // using front camera
    const cameraRef = useRef<Camera | null>(null); // camera reference

    // Face detection and image capture state
    const [faces, setFaces] = useState<any[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

    // Timing references
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const lastFaceCount = useRef<number>(0);

    // Countdown state for holding face in frame
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdownSeconds, setCountdownSeconds] = useState<number>(2);

    const [isCameraInitialized, setIsCameraInitialized] = useState(false);

    // Whether face already exists in DB or not
    const [faceExists, setFaceExists] = useState<boolean | null>(null);

    // State for blocking UI while face is processed
    const [isProcessing, setIsProcessing] = useState(false);

    // Safe area handling for iOS
    const insets = useSafeAreaInsets();

    // Route parameter from dashboard to face-verification page
    const {punchInOrPunchOut} = useLocalSearchParams();

    // UI status messages
    const [baseStatusText, setBaseStatusText] = useState<string | null>(null);
    const [dotCount, setDotCount] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // Shows a series of animated status messages
    const playStatusSequence = (finalStepText: string) => {
        setStatusMessage("Processing image...");
        setTimeout(() => setStatusMessage("Uploading image..."), 2000);
        setTimeout(() => setStatusMessage("Extracting faces..."), 2000);
        setTimeout(() => setStatusMessage(finalStepText), 4000);
    };

    // Interpolated width for loading animation
    const interpolatedWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    // Main face detection loop using setInterval
    useEffect(() => {
        if (!device || !hasPermission || !isCameraInitialized || !faceExists) return;

        intervalRef.current = setInterval(() => {
            detectFaces();
        }, 800); // detect every 800ms

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [device, hasPermission, isCameraInitialized, faceExists]);

    // Animate dots for status text like "Verifying..."
    useEffect(() => {
        if (!baseStatusText) return;

        const interval = setInterval(() => {
            setDotCount(prev => (prev + 1) % 4);
        }, 500);

        return () => clearInterval(interval);
    }, [baseStatusText]);

    // Check from server whether user has registered face
    useEffect(() => {
        (async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            try {
                const res = await fetch(config.API.IS_AVAILABLE(userId));
                const data = await res.json();
                setFaceExists(data?.body?.exists === true);
            } catch (err) {
                Alert.alert('Error', 'Could not check facial data.');
            }
        })();
    }, []);

    // Block back button if scan is in progress
    useEffect(() => {
        const onBackPress = () => isProcessing;

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        if (isProcessing) {
            progressAnim.setValue(0);
            Animated.loop(
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 30000,
                    useNativeDriver: false,
                })
            ).start();
        } else {
            progressAnim.stopAnimation();
        }

        return () => subscription.remove();
    }, [isProcessing]);


    const detectFaces = async () => {
        if (!cameraRef.current || isDetecting || isProcessing) return;

        try {
            setIsDetecting(true);
            const photo = await cameraRef.current.takeSnapshot({quality: 70});
            const imageUri = `file://${photo.path}`;

            const result = await MlkitFaceDetection.detect(imageUri, {
                landmarkMode: 'none',
                contourMode: 'none',
                classificationMode: 'none',
                minFaceSize: 0.1,
                performanceMode: 'fast',
            });

            setFaces(result || []);
            lastFaceCount.current = result.length;

            // If exactly one face is detected and countdown hasn't started
            if (result.length === 1 && !timeoutRef.current) {
                setIsCountingDown(true);
                setProgress(0);
                let count = 0;

                // Start interval to update progress bar every 100ms
                countdownAnimRef.current = setInterval(() => {
                    count += 0.05;
                    setProgress(prev => {
                        const next = prev + 0.05;
                        setCountdownSeconds(Math.ceil((1 - next) * 2)); // Calculate remaining seconds
                        return next >= 1 ? 1 : next;
                    });
                }, 100);


                // After 2.5 seconds, confirm the face and capture photo
                timeoutRef.current = setTimeout(async () => {
                    clearInterval(countdownAnimRef.current!);
                    setProgress(0);
                    setIsCountingDown(false);

                    const confirmPhoto = await cameraRef.current?.takeSnapshot({quality: 70});
                    if (!confirmPhoto) return;

                    const confirmUri = `file://${confirmPhoto.path}`;
                    const confirmResult = await MlkitFaceDetection.detect(confirmUri, {
                        landmarkMode: 'none',
                        contourMode: 'none',
                        classificationMode: 'none',
                        minFaceSize: 0.1,
                        performanceMode: 'fast',
                    });

                    if (confirmResult.length === 1) {
                        setCapturedImageUri(confirmUri);
                        clearInterval(intervalRef.current!);
                        await handleScan(confirmResult, confirmUri);
                    }

                    timeoutRef.current = null;
                }, 2300);
            } else if (result.length !== 1 && timeoutRef.current) {
                // If face is lost, cancel countdown and reset
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
                clearInterval(countdownAnimRef.current!);
                countdownAnimRef.current = null;
                setProgress(0);
                setIsCountingDown(false);
                setCountdownSeconds(2);

            }

        } catch (error) {
            console.error('Face detection error:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    // Optional mock handler to simulate infinite loading
    // const mockScan = async () => {
    //     if (isProcessing) return;
    //
    //     setIsProcessing(true);
    //     setBaseStatusText(faceExists ? 'Verifying' : 'Registering');
    //     setCapturedImageUri('https://via.placeholder.com/400x400.png?text=Mock+Face');
    //
    //     await new Promise(() => {
    //     }); // infinite wait
    // };

    // Handles image upload and backend verification or registration
    const handleScan = async (confirmedFaces: any[], imageUri: string) => {
        if (isProcessing) return;

        if (confirmedFaces.length === 0) {
            Alert.alert('No Face Detected', 'Please position your face in the frame and try again');
            return;
        }

        if (faceExists === null) {
            Alert.alert("faceExists return null");
            return;
        }

        setIsProcessing(true);
        setBaseStatusText(faceExists ? 'Verifying' : 'Registering');
        playStatusSequence(faceExists ? "Verifying face..." : "Registering face...");

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'Camera or user ID unavailable');
                return;
            }

            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                name: 'face.jpg',
                type: 'image/jpg',
            } as any);

            const endpoint = faceExists
                ? config.API.FACE_MATCH(userId, punchInOrPunchOut)
                : config.API.FACE_REGISTER(userId);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'multipart/form-data'},
                body: formData,
            });

            const raw = await response.text();
            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                Alert.alert('Error', 'Server returned invalid response.');
                resetScanState();
                return;
            }

            if (faceExists) {
                if (data.body?.matched) {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: data.body?.message || 'Face matched!',
                        position: 'bottom',
                        visibilityTime: 4000,
                        autoHide: true,
                        onPress: () => Toast.hide(),
                    });
                    await AsyncStorage.setItem('punchStatus', punchInOrPunchOut === 'punchIn' ? 'true' : 'false');
                    router.replace('/dashboard');
                } else {
                    Alert.alert('Failed', data.body?.message);
                    resetScanState();
                }
            } else {
                if (data.body?.success) {
                    Alert.alert('Success', 'Face registered successfully!');
                    router.replace('/dashboard');
                } else {
                    Alert.alert('Failed', data.body?.message || 'Registration failed');
                    resetScanState();
                }
            }

        } catch (error) {
            Alert.alert('Failed', 'Face scan failed. Try again.');
            resetScanState();
        } finally {
            setIsProcessing(false);
            setBaseStatusText(null);
            setDotCount(0);
            setStatusMessage(null);
        }
    };

    // Reset all scan states to start fresh
    const resetScanState = () => {
        setCapturedImageUri(null);
        setBaseStatusText(null);
        setStatusMessage(null);
        setDotCount(0);
        setIsProcessing(false);
        progressAnim.stopAnimation();
        progressAnim.setValue(0);
    };

    // Request camera permissions on mount
    useEffect(() => {
        (async () => {
            await requestPermission();
        })();
    }, [requestPermission]);

    // Return basic UI if camera isn't available or allowed
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
                                isActive={!!device && !isProcessing}
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
                    <View style={styles.ovalBorder} pointerEvents="none" />
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
                    {/*    <View style={[*/}
                    {/*        styles.faceStatusIndicator,*/}
                    {/*        { backgroundColor: faces.length > 0 ? '#4CAF50' : '#FF5722' }*/}
                    {/*    ]}>*/}
                    {/*        <Text style={styles.faceStatusText}>*/}
                    {/*            {faces.length > 0 ? `✓ Face Detected` : '○ No Face Detected'}*/}
                    {/*        </Text>*/}
                    {/*    </View>*/}
                    {/*</View>*/}
                </View>

                {/* Dynamic status message */}
                {statusMessage && (
                    <Animatable.Text
                        animation="fadeIn"
                        duration={400}
                        style={styles.statusText}
                    >
                        {statusMessage}
                    </Animatable.Text>
                )}
            </View>
        </View>
    );
};

export default BiometricScanScreen;
