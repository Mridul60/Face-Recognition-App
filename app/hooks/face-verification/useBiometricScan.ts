// hooks/useBiometricScan.ts
import {useEffect, useRef, useState} from 'react';
import {Alert, Animated} from 'react-native';
import {
    useCameraDevice,
    useCameraPermission,
    Camera,
} from 'react-native-vision-camera';
import {router, useLocalSearchParams} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import config from "../../../config";

export const useBiometricScan = (punchInOrPunchOut: string | string[]) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('front');
    const cameraRef = useRef<Camera | null>(null);
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);
    const [faceExists, setFaceExists] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

    // Status message states
    const [baseStatusText, setBaseStatusText] = useState<string | null>(null);
    const [dotCount, setDotCount] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const playStatusSequence = (finalStepText: string) => {
        setStatusMessage("Processing image...");
        setTimeout(() => setStatusMessage("Uploading image..."), 2000);
        setTimeout(() => setStatusMessage("Extracting faces..."), 2000);
        setTimeout(() => setStatusMessage(finalStepText), 4000);
    };

    // Check if face exists for current user
    useEffect(() => {
        (async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            try {
                const res = await fetch(config.API.IS_AVAILABLE(userId));
                const data = await res.json();
                console.log("data for faceexists: ", data);
                setFaceExists(data?.body?.exists === true);
            } catch (err) {
                Alert.alert('Error', 'Could not check facial data.');
            }
        })();
    }, []);

    // Animate dots while baseStatusText is shown
    useEffect(() => {
        if (!baseStatusText) return;

        const interval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
        }, 500);

        return () => clearInterval(interval);
    }, [baseStatusText]);

    // Progress animation
    useEffect(() => {
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
    }, [isProcessing]);

    // Request camera permission
    useEffect(() => {
        (async () => {
            await requestPermission();
        })();
    }, [requestPermission]);

    // Helper function to reset all scan-related states
    const resetScanState = () => {
        setCapturedPhotoUri(null);
        setBaseStatusText(null);
        setStatusMessage(null);
        setDotCount(0);
        setIsProcessing(false);
        progressAnim.stopAnimation();
        progressAnim.setValue(0);
    };

    const handleScan = async (faces: any[], imageUri: string) => {
        if (isProcessing) return;
        if (faces.length === 0) {
            Alert.alert('No Face Detected', 'Please position your face in the frame and try again');
            return;
        }

        setIsProcessing(true);
        console.log("faceExists", faceExists);
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

            console.log(punchInOrPunchOut)
            const endpoint = faceExists
                ? config.API.FACE_MATCH(userId, punchInOrPunchOut)
                : config.API.FACE_REGISTER(userId);

            console.log("face-verification/before response", new Date().toLocaleTimeString());
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
            console.log("face-verification/after response", new Date().toLocaleTimeString());

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

    return {
        hasPermission,
        requestPermission,
        device,
        cameraRef,
        capturedPhotoUri,
        setCapturedPhotoUri,
        isProcessing,
        faceExists,
        statusMessage,
        handleScan,
        isCameraInitialized,
        setIsCameraInitialized,
    };
};