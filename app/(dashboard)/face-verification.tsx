import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import styles from './styles-face-verification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const BiometricScanScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [faceExists, setFaceExists] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
    const { punchInOrPunchOut } = useLocalSearchParams();

    // New states for animated status text
    const [baseStatusText, setBaseStatusText] = useState<string | null>(null);
    const [dotCount, setDotCount] = useState<number>(0);

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
            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                Alert.alert('Error', 'Server returned invalid response.');
                return;
            }

            if (faceExists) {
                if (data.body?.matched) {
                    Alert.alert('Success', data.body?.message);
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
            Alert.alert('Error', 'Face scan failed. Try again.');
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Facial {faceExists ? 'Verification' : 'Registration'}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={router.back}>
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    {faceExists ? 'Align Your Face to Verify' : 'Align Your Face to Register'}
                </Text>

                <View style={styles.scanArea}>
                    {capturedPhotoUri ? (
                        <Image
                            source={{ uri: capturedPhotoUri }}
                            style={[StyleSheet.absoluteFill, { transform: [{ scaleX: -1 }] }]}
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
                    <View style={styles.ovalBorder} pointerEvents="none" />
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />
                </View>

                <View style={styles.instructionCard}>
                    <Text style={styles.instructionText}>
                        Please align your face and ensure you are in a well-lit environment.
                    </Text>
                </View>

                {/* ⬇️ Dynamic verifying/registering bouncing dots */}
                {baseStatusText && (
                    <Animatable.Text
                        animation="fadeIn"
                        duration={400}
                        style={styles.statusText}
                    >
                        {`${baseStatusText}${'.'.repeat(dotCount)}`}
                    </Animatable.Text>
                )}

                <TouchableOpacity
                    style={[styles.scanButton, isProcessing && { opacity: 0.6 }]}
                    onPress={handleScan}
                    disabled={isProcessing}
                >
                    <Text style={styles.scanButtonText}>{faceExists ? 'VERIFY' : 'REGISTER'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BiometricScanScreen;
