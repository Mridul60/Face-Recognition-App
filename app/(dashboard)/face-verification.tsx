import React, {useEffect, useRef, useState} from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Image,
    Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {router, useLocalSearchParams} from 'expo-router';
import styles from './styles-face-verification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../../config"
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Logo from '@/assets/icons/GEEK-Id.svg'
import {Animated} from 'react-native';
import {ActivityIndicator} from 'react-native';
import Toast from 'react-native-toast-message';

const BiometricScanScreen = () => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [faceExists, setFaceExists] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const insets = useSafeAreaInsets();
    const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
    const {punchInOrPunchOut} = useLocalSearchParams();

    // New states for animated status text
    const [baseStatusText, setBaseStatusText] = useState<string | null>(null);
    const [dotCount, setDotCount] = useState<number>(0);

    const interpolatedWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });


    // Animate dots while baseStatusText is shown
    useEffect(() => {
        if (!baseStatusText) return;

        const interval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4); // cycle 0 to 3
        }, 500);

        return () => clearInterval(interval);
    }, [baseStatusText]);

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

    useEffect(() => {
        if (isProcessing) {
            progressAnim.setValue(0);
            Animated.loop(
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 20000,
                    useNativeDriver: false, // width is not transform, so false
                })
            ).start();
        } else {
            progressAnim.stopAnimation();
        }
    }, [isProcessing]);


    const mockScan = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setBaseStatusText(faceExists ? 'Verifying' : 'Registering');

        // Keep the loading state active indefinitely
        // until the developer manually stops it (e.g., via reload or timeout)
        console.log("🔁 Simulating infinite loading...");

        // Optionally simulate captured photo
        setCapturedPhotoUri('https://via.placeholder.com/400x400.png?text=Mock+Face');

        // 🔁 This Promise never resolves
        await new Promise(() => {
        }); // infinite pending

        // This code will never run unless the Promise is canceled or screen is reloaded
    };


    const handleScan = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setBaseStatusText(faceExists ? 'Verifying' : 'Registering');

        try {
            if (!cameraRef.current) return;
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                skipProcessing: true,
            });

            setCapturedPhotoUri(photo.uri);

            const userId = await AsyncStorage.getItem('userId');
            if (!photo?.uri || !userId) {
                Alert.alert('Error', 'Camera or user ID unavailable');
                return;
            }

            const formData = new FormData();
            formData.append('image', {
                uri: photo.uri,
                name: 'face.jpg',
                type: 'image/jpg',
            } as any);

            const endpoint = faceExists
                ? config.API.FACE_MATCH(userId, punchInOrPunchOut)
                : config.API.FACE_REGISTER(userId);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const raw = await response.text();
            console.log("raw: ", raw);

            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                Alert.alert('Error', 'Server returned invalid response.');
                return;
            }

            if (faceExists) {
                if (data.body?.matched) {
                    // Alert.alert('Success', data.body?.message);
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: data.body?.message || 'Face matched!',
                        position: 'bottom',
                    });

                    await AsyncStorage.setItem('punchStatus', punchInOrPunchOut === 'punchIn' ? 'true' : 'false');
                    router.replace('/dashboard');
                } else {
                    Alert.alert('Failed', data.body?.message);
                }
            } else {
                if (data.body?.success) {
                    Alert.alert('Success', 'Face registered successfully!');
                    router.replace('/dashboard');
                } else {
                    Alert.alert('Failed', data.body?.message || 'Registration failed');
                }
            }

        } catch (error) {
            Alert.alert('Failed', 'Face scan failed. Try again.');
            setCapturedPhotoUri(null); // Clear stuck photo
            setBaseStatusText(null);   // Clear status
            setDotCount(0);
        } finally {
            setIsProcessing(false);
            setBaseStatusText(null);
            setDotCount(0);
        }
    };
    if (!permission || !permission.granted) {
        return (
            <View style={styles.centered}>
                <Text>No camera access</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.scanButton}>
                    <Text style={styles.scanButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.header, {paddingTop: Platform.OS === 'ios' ? insets.top : 10}]}>
                <Logo width={142} height={54}/>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    {faceExists ? 'Align Your Face to Verify' : 'Align Your Face to Register'}
                </Text>

                <View style={styles.scanArea}>
                    {capturedPhotoUri ? (
                        <Image
                            source={{uri: capturedPhotoUri}}
                            style={[StyleSheet.absoluteFill, {transform: [{scaleX: -1}]}]}
                            resizeMode="cover"
                        />
                    ) : (
                        <CameraView
                            ref={cameraRef}
                            style={StyleSheet.absoluteFill}
                            facing="front"
                        />
                    )}

                    <Animatable.View
                        animation="pulse"
                        easing="ease-in-out"
                        iterationCount="infinite"
                        duration={1400}
                        style={styles.dottedOval}
                    />
                    <View style={styles.ovalBorder} pointerEvents="none"/>
                    <View style={styles.cornerTopLeft}/>
                    <View style={styles.cornerTopRight}/>
                    <View style={styles.cornerBottomLeft}/>
                    <View style={styles.cornerBottomRight}/>
                </View>

                <View style={styles.instructionCard}>
                    <Text style={styles.instructionText}>
                        Please align your face and ensure you are in a well-lit environment.
                    </Text>
                </View>

                {/* ⬇️ Dynamic verifying/registering bouncing dots
                {baseStatusText && (
                    <Animatable.Text
                        animation="fadeIn"
                        duration={400}
                        style={styles.statusText}
                    >
                        {`${baseStatusText}${'.'.repeat(dotCount)}`}
                    </Animatable.Text>
                )} */}

                {isProcessing && (
                    <View style={styles.progressBarContainer}>
                        <Animated.View
                            style={[styles.progressBar, {width: interpolatedWidth}]}
                        />

                    </View>
                )}
                <TouchableOpacity
                    style={[styles.scanButton, isProcessing && {opacity: 0.6}]}
                    onPress={handleScan}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#FFFFFF" size="small"/>
                    ) : (
                        <Text style={styles.scanButtonText}>{faceExists ? 'VERIFY' : 'REGISTER'}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BiometricScanScreen;


// const handleScan = async () => {
//     const totalStartTime = Date.now();
//     console.log('🕐 FRONTEND: Starting face scan process...');
//
//     if (isProcessing) return;
//     setIsProcessing(true);
//     setBaseStatusText(faceExists ? 'Verifying' : 'Registering');
//
//     try {
//         // Camera capture timing
//         const captureStartTime = Date.now();
//         console.log('📸 FRONTEND: Starting camera capture...');
//
//         if (!cameraRef.current) return;
//         const photo = await cameraRef.current.takePictureAsync({
//             quality: 0.5,
//             skipProcessing: true,
//         });
//
//         const captureEndTime = Date.now();
//         console.log(`📸 FRONTEND: Camera capture completed in ${captureEndTime - captureStartTime}ms`);
//
//         setCapturedPhotoUri(photo.uri);
//
//         // Data preparation timing
//         const dataStartTime = Date.now();
//         console.log('📋 FRONTEND: Preparing data...');
//
//         const userId = await AsyncStorage.getItem('userId');
//         if (!photo?.uri || !userId) {
//             Alert.alert('Error', 'Camera or user ID unavailable');
//             return;
//         }
//
//         const formData = new FormData();
//         formData.append('image', {
//             uri: photo.uri,
//             name: 'face.jpg',
//             type: 'image/jpg',
//         } as any);
//
//         const endpoint = faceExists
//             ? config.API.FACE_MATCH(userId, punchInOrPunchOut)
//             : config.API.FACE_REGISTER(userId);
//
//         const dataEndTime = Date.now();
//         console.log(`📋 FRONTEND: Data preparation completed in ${dataEndTime - dataStartTime}ms`);
//
//         // Network request timing
//         const networkStartTime = Date.now();
//         console.log('🌐 FRONTEND: Starting network request...');
//         console.log(`🌐 FRONTEND: Request URL: ${endpoint}`);
//
//         const response = await fetch(endpoint, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//             body: formData,
//         });
//
//         const networkEndTime = Date.now();
//         console.log(`🌐 FRONTEND: Network request completed in ${networkEndTime - networkStartTime}ms`);
//
//         // Response processing timing
//         const responseStartTime = Date.now();
//         console.log('📥 FRONTEND: Processing response...');
//
//         const raw = await response.text();
//         let data;
//         try {
//             data = JSON.parse(raw);
//         } catch (err) {
//             Alert.alert('Error', 'Server returned invalid response.');
//             return;
//         }
//
//         const responseEndTime = Date.now();
//         console.log(`📥 FRONTEND: Response processing completed in ${responseEndTime - responseStartTime}ms`);
//
//         // Result handling
//         if (faceExists) {
//             if (data.body?.matched) {
//                 Alert.alert('Success', data.body?.message);
//                 await AsyncStorage.setItem('punchStatus', punchInOrPunchOut === 'punchIn' ? 'true' : 'false');
//                 router.replace('/dashboard');
//             } else {
//                 Alert.alert('Failed', data.body?.message);
//             }
//         } else {
//             if (data.body?.success) {
//                 Alert.alert('Success', 'Face registered successfully!');
//                 router.replace('/dashboard');
//             } else {
//                 Alert.alert('Failed', data.body?.message || 'Registration failed');
//             }
//         }
//
//         const totalEndTime = Date.now();
//         console.log(`🎉 FRONTEND: Total process completed in ${totalEndTime - totalStartTime}ms`);
//         console.log('='.repeat(50));
//
//     } catch (error) {
//         const errorTime = Date.now();
//         console.log(`❌ FRONTEND: Error occurred after ${errorTime - totalStartTime}ms`);
//         console.log(`❌ FRONTEND: Error details:`, error);
//
//         Alert.alert('Error', 'Face scan failed. Try again.');
//         setCapturedPhotoUri(null);
//         setBaseStatusText(null);
//         setDotCount(0);
//     } finally {
//         setIsProcessing(false);
//         setBaseStatusText(null);
//         setDotCount(0);
//     }
// };
