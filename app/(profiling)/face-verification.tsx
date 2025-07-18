// BiometricScanScreen.tsx
import React, {useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {Camera} from 'react-native-vision-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Logo from '@/assets/icons/GEEK-Id.svg';
import {ActivityIndicator} from 'react-native';
import Toast from 'react-native-toast-message';

import styles from './styles-face-verification';
import {useBiometricScan} from '../hooks/face-verification/useBiometricScan';
import {useFaceDetection} from '../hooks/face-verification/useFaceDetection';
import {useBackHandler} from '../hooks/face-verification/useBackHandler'
import {CameraPermissionScreen} from '../Components/face-verification/CameraPermissionScreen'
import {FaceDetectionOverlay} from '../Components/face-verification/FaceDetectionOverlay'
import {InstructionCard} from '../Components/face-verification/InstructionCard'
import {StatusMessage} from '../Components/face-verification/StatusMessage'

const BiometricScanScreen = () => {
    const insets = useSafeAreaInsets();

    const {
        hasPermission,
        requestPermission,
        device,
        cameraRef,
        capturedPhotoUri,
        isProcessing,
        faceExists,
        statusMessage,
        handleScan,
        isCameraInitialized,
        setIsCameraInitialized,
    } = useBiometricScan();

    const {faces, capturedImageUri} = useFaceDetection({
        cameraRef,
        device,
        hasPermission,
        isCameraInitialized,
        isProcessing,
    });

    useBackHandler(isProcessing);

    useEffect(() => {
        if (faces.length === 1 && !isProcessing) {
            handleScan(faces);
        }
    }, [faces, isProcessing, handleScan]);

    if (!hasPermission) {
        return (
            <CameraPermissionScreen onRequestPermission={requestPermission} />
        );
    }

    if (device == null) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No camera device found</Text>
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
                    {capturedImageUri ? (
                        <Image
                            source={{uri: capturedImageUri}}
                            style={[StyleSheet.absoluteFill, {transform: [{scaleX: -1}]}]}
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

                    <FaceDetectionOverlay faces={faces} capturedPhotoUri={capturedImageUri} />

                    <Animatable.View
                        animation="pulse"
                        easing="ease-in-out"
                        iterationCount="infinite"
                        duration={1400}
                        style={[
                            styles.dottedOval,
                            { borderColor: faces.length > 0 ? '#4CAF50' : '#FF5722' }
                        ]}
                    />
                    <View style={styles.ovalBorder} pointerEvents="none"/>
                    <View style={styles.cornerTopLeft}/>
                    <View style={styles.cornerTopRight}/>
                    <View style={styles.cornerBottomLeft}/>
                    <View style={styles.cornerBottomRight}/>
                </View>

                <InstructionCard faces={faces} />

                <StatusMessage statusMessage={statusMessage} />

                {/*<TouchableOpacity*/}
                {/*    style={[*/}
                {/*        styles.scanButton,*/}
                {/*        isProcessing && {opacity: 0.6},*/}
                {/*        faces.length > 0 && !isProcessing && {backgroundColor: '#4CAF50'}*/}
                {/*    ]}*/}
                {/*    onPress={() => handleScan(faces)}*/}
                {/*    disabled={isProcessing}*/}
                {/*>*/}
                {/*    {isProcessing ? (*/}
                {/*        <ActivityIndicator color="#FFFFFF" size="small"/>*/}
                {/*    ) : (*/}
                {/*        <Text style={styles.scanButtonText}>*/}
                {/*            {faceExists ? 'VERIFY' : 'REGISTER'}*/}
                {/*        </Text>*/}
                {/*    )}*/}
                {/*</TouchableOpacity>*/}
            </View>
        </View>
    );
};

export default BiometricScanScreen;
