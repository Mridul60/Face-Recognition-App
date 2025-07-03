import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import styles from './styles-face-verification';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BiometricScanScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [faceExists, setFaceExists] = useState<boolean | null>(null);

    // Step 1: Check if user's face is already registered
    useEffect(() => {
        (async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            try {
                const res = await fetch(`http://192.168.195.5:9000/face/isAvailable/${userId}`);
                const data = await res.json();
                setFaceExists(data?.body?.exists === true);
            } catch (err) {
                console.error("Failed to check face availability", err);
                Alert.alert("Error", "Could not check facial data.");
            }
        })();
    }, []);

    // Step 2: Handle face capture and upload
    const handleScan = async () => {
        try {
            if (!cameraRef.current) return;

            const photo = await cameraRef.current.takePictureAsync();
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
                ? `http://192.168.195.5:9000/face/match/${userId}`
                : `http://192.168.195.5:9000/face/register/${userId}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const raw = await response.text();
            console.log('Raw server response:', raw);

            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                console.error('Invalid JSON:', raw);
                Alert.alert('Error', 'Server returned invalid response.');
                return;
            }

            if (faceExists) {
                if (data.body?.matched) {
                    Alert.alert('Success', 'Face matched. Punch recorded!');
                    router.replace('/(dashboard)');
                } else {
                    Alert.alert('Failed', 'Face does not match.');
                }
            } else {
                if (data.body?.success) {
                    Alert.alert('Success', 'Face registered successfully!');
                    router.replace('/(dashboard)');
                } else {
                    Alert.alert('Failed', data.body?.message || 'Registration failed');
                }
            }

        } catch (error) {
            console.error('Face scan failed:', error);
            Alert.alert('Error', 'Face scan failed. Try again.');
        }
    };

    // Step 3: Handle camera permission
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
                <Text style={styles.title}>{faceExists ? 'Align Your Face to Verify' : 'Align Your Face to Register'}</Text>

                <View style={styles.scanArea}>
                    <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />

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
                        Position your face within the frame and keep still.
                    </Text>
                </View>

                <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
                    <Text style={styles.scanButtonText}>{faceExists ? 'VERIFY' : 'REGISTER'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BiometricScanScreen;
