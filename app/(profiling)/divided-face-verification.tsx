//
// // BiometricScanScreen.tsx
// import React, {useEffect} from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     Image,
//     Platform,
// } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import {Camera} from 'react-native-vision-camera';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import Logo from '@/assets/icons/GEEK-Id.svg';
// import {ActivityIndicator} from 'react-native';
// import Toast from 'react-native-toast-message';
// import { AnimatedCircularProgress } from 'react-native-circular-progress';
//
// import styles from './styles-face-verification';
// import {useBiometricScan} from '../hooks/face-verification/useBiometricScan';
// import {useFaceDetection} from '../hooks/face-verification/useFaceDetection';
// import {useBackHandler} from '../hooks/face-verification/useBackHandler'
// import {CameraPermissionScreen} from '../Components/face-verification/CameraPermissionScreen'
// import {FaceDetectionOverlay} from '../Components/face-verification/FaceDetectionOverlay'
// import {InstructionCard} from '../Components/face-verification/InstructionCard'
// import {StatusMessage} from '../Components/face-verification/StatusMessage'
// import OvalProgress from '../../components/OvalProgress'
// import {useLocalSearchParams} from "expo-router";
// import RoundedProgressBar from "@/app/Components/face-verification/RoundedProgressBar";
// const BiometricScanScreen = () => {
//     const insets = useSafeAreaInsets();
//     const {punchInOrPunchOut} = useLocalSearchParams();
//
//     const {
//         hasPermission,
//         requestPermission,
//         device,
//         cameraRef,
//         isProcessing,
//         faceExists,
//         statusMessage,
//         handleScan,
//         isCameraInitialized,
//         setIsCameraInitialized,
//     } = useBiometricScan(punchInOrPunchOut);
//
//     const {faces, capturedImageUri, isCountingDown} = useFaceDetection({
//         cameraRef,
//         device,
//         hasPermission,
//         isCameraInitialized,
//         isProcessing,
//         handleScan
//     });
//
//     useBackHandler(isProcessing);
//
//     // useEffect(() => {
//     //     if (faces.length === 1 && !isProcessing) {
//     //         handleScan(faces);
//     //     }
//     // }, [faces, isProcessing, handleScan]);
//
//     if (!hasPermission) {
//         return (
//             <CameraPermissionScreen onRequestPermission={requestPermission} />
//         );
//     }
//
//     if (device == null) {
//         return (
//             <View style={styles.centered}>
//                 <Text style={styles.errorText}>No camera device found</Text>
//             </View>
//         );
//     }
//
//     return (
//         <View style={styles.container}>
//             <View style={[styles.header, {paddingTop: Platform.OS === 'ios' ? insets.top : 10}]}>
//                 <Logo width={142} height={54}/>
//             </View>
//
//             <View style={styles.content}>
//                 <Text style={styles.title}>
//                     {faceExists ? 'Align Your Face to Verify' : 'Align Your Face to Register'}
//                 </Text>
//
//                 <View style={styles.scanArea}>
//                     {capturedImageUri ? (
//                         <Image
//                             source={{uri: capturedImageUri}}
//                             style={[StyleSheet.absoluteFill, {transform: [{scaleX: -1}]}]}
//                             resizeMode="cover"
//                         />
//                     ) : (
//                         <Camera
//                             ref={cameraRef}
//                             style={StyleSheet.absoluteFill}
//                             device={device}
//                             isActive={!!device && !isProcessing}
//                             photo={true}
//                             onInitialized={() => setIsCameraInitialized(true)}
//                         />
//                     )}
//
//                     <FaceDetectionOverlay faces={faces} capturedPhotoUri={capturedImageUri} />
//
//                     <Animatable.View
//                         animation="pulse"
//                         easing="ease-in-out"
//                         iterationCount="infinite"
//                         duration={1400}
//                         style={[
//                             styles.dottedOval,
//                             { borderColor: faces.length > 0 ? '#4CAF50' : '#FF5722' }
//                         ]}
//                     />
//                     <View style={styles.ovalBorder} pointerEvents="none"/>
//                     {/*<View style={styles.cornerTopLeft}/>*/}
//                     {/*<View style={styles.cornerTopRight}/>*/}
//                     {/*<View style={styles.cornerBottomLeft}/>*/}
//                     {/*<View style={styles.cornerBottomRight}/>*/}
//                 </View>
//
//                 <InstructionCard faces={faces} />
//
//                 <StatusMessage statusMessage={statusMessage} />
//
//                 {/*<TouchableOpacity*/}
//                 {/*    style={[*/}
//                 {/*        styles.scanButton,*/}
//                 {/*        isProcessing && {opacity: 0.6},*/}
//                 {/*        faces.length > 0 && !isProcessing && {backgroundColor: '#4CAF50'}*/}
//                 {/*    ]}*/}
//                 {/*    onPress={() => handleScan(faces)}*/}
//                 {/*    disabled={isProcessing}*/}
//                 {/*>*/}
//                 {/*    {isProcessing ? (*/}
//                 {/*        <ActivityIndicator color="#FFFFFF" size="small"/>*/}
//                 {/*    ) : (*/}
//                 {/*        <Text style={styles.scanButtonText}>*/}
//                 {/*            {faceExists ? 'VERIFY' : 'REGISTER'}*/}
//                 {/*        </Text>*/}
//                 {/*    )}*/}
//                 {/*</TouchableOpacity>*/}
//                 {/*{isCountingDown && <OvalProgress visible={true} />}*/}
//             </View>
//         </View>
//     );
// };
//
// export default BiometricScanScreen;
//
// //
// // import React, {useEffect, useRef, useState} from 'react';
// // import {
// //     View, Text, TouchableOpacity, StyleSheet, Alert, Image,
// //     Platform,
// // } from 'react-native';
// // import * as Animatable from 'react-native-animatable';
// // import {
// //     useCameraDevice,
// //     useCameraPermission,
// //     Camera,
// // } from 'react-native-vision-camera';
// // import MlkitFaceDetection from '@react-native-ml-kit/face-detection';
// // import {router, useLocalSearchParams} from 'expo-router';
// // import styles from './styles-face-verification';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import config from "../../config"
// // import {useSafeAreaInsets} from 'react-native-safe-area-context';
// // import Logo from '@/assets/icons/GEEK-Id.svg'
// // import {Animated} from 'react-native';
// // import {ActivityIndicator} from 'react-native';
// // import Toast from 'react-native-toast-message';
// // import {BackHandler} from 'react-native';
// //
// // const BiometricScanScreen = () => {
// //     const progressAnim = useRef(new Animated.Value(0)).current;
// //     const { hasPermission, requestPermission } = useCameraPermission();
// //     const device = useCameraDevice('front');
// //     const cameraRef = useRef<Camera | null>(null);
// //     const [faces, setFaces] = useState<any[]>([]);
// //     const [photo, setPhoto] = useState<string>("");
// //     const [isDetecting, setIsDetecting] = useState(false);
// //
// //     const [isCameraInitialized, setIsCameraInitialized] = useState(false);
// //
// //     const [faceExists, setFaceExists] = useState<boolean | null>(null);
// //     const [isProcessing, setIsProcessing] = useState(false);
// //     const insets = useSafeAreaInsets();
// //     const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
// //     const {punchInOrPunchOut} = useLocalSearchParams();
// //
// //     // New states for animated status text
// //     const [baseStatusText, setBaseStatusText] = useState<string | null>(null);
// //     const [dotCount, setDotCount] = useState<number>(0);
// //     const [statusMessage, setStatusMessage] = useState<string | null>(null);
// //
// //     const playStatusSequence = (finalStepText: string) => {
// //         setStatusMessage("Processing image...");
// //         setTimeout(() => setStatusMessage("Uploading image..."), 2000);
// //         setTimeout(() => setStatusMessage("Extracting faces..."), 2000);
// //         setTimeout(() => setStatusMessage(finalStepText), 4000);
// //     };
// //
// //     const interpolatedWidth = progressAnim.interpolate({
// //         inputRange: [0, 1],
// //         outputRange: ['0%', '100%'],
// //     });
// //
// //     // Detect faces in real-time by taking photos periodically
// //     const detectFaces = async () => {
// //         if (!cameraRef.current || isDetecting || isProcessing) return;
// //
// //         try {
// //             setIsDetecting(true);
// //
// //             const photo = await cameraRef.current.takePhoto({});
// //
// //             // Convert the path to a URI
// //             const imageUri = `file://${photo.path}`;
// //
// //             const result = await MlkitFaceDetection.detect(imageUri, {
// //                 landmarkMode: 'none',
// //                 contourMode: 'none',
// //                 classificationMode: 'none',
// //                 minFaceSize: 0.1,
// //                 performanceMode: 'fast',
// //             });
// //
// //             setFaces(result || []);
// //         } catch (error) {
// //             console.error('Face detection error:', error);
// //         } finally {
// //             setIsDetecting(false);
// //         }
// //     };
// //
// //     // Real-time face detection
// //     useEffect(() => {
// //         if (!device || !hasPermission || !isCameraInitialized) return;
// //
// //         const interval = setInterval(() => {
// //             detectFaces();
// //         }, 300);
// //
// //         return () => clearInterval(interval);
// //     }, [device, hasPermission, isCameraInitialized]);
// //
// //     // Animate dots while baseStatusText is shown
// //     useEffect(() => {
// //         if (!baseStatusText) return;
// //
// //         const interval = setInterval(() => {
// //             setDotCount((prev) => (prev + 1) % 4); // cycle 0 to 3
// //         }, 500);
// //
// //         return () => clearInterval(interval);
// //     }, [baseStatusText]);
// //
// //     useEffect(() => {
// //         (async () => {
// //             const userId = await AsyncStorage.getItem('userId');
// //             if (!userId) return;
// //
// //             try {
// //                 const res = await fetch(config.API.IS_AVAILABLE(userId));
// //                 const data = await res.json();
// //                 setFaceExists(data?.body?.exists === true);
// //             } catch (err) {
// //                 Alert.alert('Error', 'Could not check facial data.');
// //             }
// //         })();
// //     }, []);
// //
// //     useEffect(() => {
// //         const onBackPress = () => {
// //             if (isProcessing) {
// //                 return true; // Disable back button when processing
// //             }
// //             return false; // Allow default back behavior
// //         };
// //         const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
// //
// //         if (isProcessing) {
// //             progressAnim.setValue(0);
// //             Animated.loop(
// //                 Animated.timing(progressAnim, {
// //                     toValue: 1,
// //                     duration: 30000,
// //                     useNativeDriver: false, // width is not transform, so false
// //                 })
// //             ).start();
// //         } else {
// //             progressAnim.stopAnimation();
// //         }
// //         return () => subscription.remove();
// //     }, [isProcessing]);
// //
// //     const mockScan = async () => {
// //         if (isProcessing) return;
// //
// //         setIsProcessing(true);
// //         setBaseStatusText(faceExists ? 'Verifying' : 'Registering');
// //
// //         // Keep the loading state active indefinitely
// //         // until the developer manually stops it (e.g., via reload or timeout)
// //         console.log("🔁 Simulating infinite loading...");
// //
// //         // Optionally simulate captured photo
// //         setCapturedPhotoUri('https://via.placeholder.com/400x400.png?text=Mock+Face');
// //
// //         // 🔁 This Promise never resolves
// //         await new Promise(() => {
// //         }); // infinite pending
// //
// //         // This code will never run unless the Promise is canceled or screen is reloaded
// //     };
// //
// //     const handleScan = async () => {
// //         if (isProcessing) return;
// //
// //         // Check if face is detected before proceeding
// //         if (faces.length === 0) {
// //             Alert.alert('No Face Detected', 'Please position your face in the frame and try again');
// //             return;
// //         }
// //
// //         setIsProcessing(true);
// //         setBaseStatusText(faceExists ? 'Verifying' : 'Registering');
// //         playStatusSequence(faceExists ? "Verifying face..." : "Registering face...");
// //
// //         try {
// //             if (!cameraRef.current) return;
// //
// //             const photo = await cameraRef.current.takePhoto({});
// //
// //             const imageUri = `file://${photo.path}`;
// //             setCapturedPhotoUri(imageUri);
// //
// //             const userId = await AsyncStorage.getItem('userId');
// //             if (!photo?.path || !userId) {
// //                 Alert.alert('Error', 'Camera or user ID unavailable');
// //                 return;
// //             }
// //
// //             const formData = new FormData();
// //             formData.append('image', {
// //                 uri: imageUri,
// //                 name: 'face.jpg',
// //                 type: 'image/jpg',
// //             } as any);
// //
// //             const endpoint = faceExists
// //                 ? config.API.FACE_MATCH(userId, punchInOrPunchOut)
// //                 : config.API.FACE_REGISTER(userId);
// //
// //             console.log("face-verification/before response", new Date().toLocaleTimeString());
// //             const response = await fetch(endpoint, {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'multipart/form-data',
// //                 },
// //                 body: formData,
// //             });
// //             console.log("face-verification/after response", new Date().toLocaleTimeString());
// //
// //             const raw = await response.text();
// //
// //             let data;
// //             try {
// //                 data = JSON.parse(raw);
// //             } catch (err) {
// //                 Alert.alert('Error', 'Server returned invalid response.');
// //                 // Reset states when JSON parsing fails
// //                 resetScanState();
// //                 return;
// //             }
// //
// //             if (faceExists) {
// //                 if (data.body?.matched) {
// //                     Toast.show({
// //                         type: 'success',
// //                         text1: 'Success',
// //                         text2: data.body?.message || 'Face matched!',
// //                         position: 'bottom',
// //                         visibilityTime: 4000,
// //                         autoHide: true,
// //                         onPress: () => Toast.hide(),
// //                     });
// //
// //                     await AsyncStorage.setItem('punchStatus', punchInOrPunchOut === 'punchIn' ? 'true' : 'false');
// //                     router.replace('/dashboard');
// //                 } else {
// //                     Alert.alert('Failed', data.body?.message);
// //                     // Reset states when face doesn't match
// //                     resetScanState();
// //                 }
// //             } else {
// //                 if (data.body?.success) {
// //                     Alert.alert('Success', 'Face registered successfully!');
// //                     router.replace('/dashboard');
// //                 } else {
// //                     Alert.alert('Failed', data.body?.message || 'Registration failed');
// //                     // Reset states when registration fails
// //                     resetScanState();
// //                 }
// //             }
// //
// //         } catch (error) {
// //             Alert.alert('Failed', 'Face scan failed. Try again.');
// //             resetScanState();
// //         } finally {
// //             setIsProcessing(false);
// //             setBaseStatusText(null);
// //             setDotCount(0);
// //             setStatusMessage(null);
// //         }
// //     };
// //
// //     // Helper function to reset all scan-related states
// //     const resetScanState = () => {
// //         setCapturedPhotoUri(null);
// //         setBaseStatusText(null);
// //         setStatusMessage(null);
// //         setDotCount(0);
// //         setIsProcessing(false);
// //         progressAnim.stopAnimation();
// //         progressAnim.setValue(0);
// //     };
// //
// //     useEffect(() => {
// //         (async () => {
// //             await requestPermission();
// //         })();
// //     }, [requestPermission]);
// //
// //     if (!hasPermission) {
// //         return (
// //             <View style={styles.centered}>
// //                 <Text>No camera access</Text>
// //                 <TouchableOpacity onPress={requestPermission} style={styles.scanButton}>
// //                     <Text style={styles.scanButtonText}>Grant Permission</Text>
// //                 </TouchableOpacity>
// //             </View>
// //         );
// //     }
// //
// //     if (device == null) {
// //         return (
// //             <View style={styles.centered}>
// //                 <Text style={styles.errorText}>No camera device found</Text>
// //             </View>
// //         );
// //     }
// //
// //     return (
// //         <View style={styles.container}>
// //             <View style={[styles.header, {paddingTop: Platform.OS === 'ios' ? insets.top : 10}]}>
// //                 <Logo width={142} height={54}/>
// //             </View>
// //
// //             <View style={styles.content}>
// //                 <Text style={styles.title}>
// //                     {faceExists ? 'Align Your Face to Verify' : 'Align Your Face to Register'}
// //                 </Text>
// //
// //                 <View style={styles.scanArea}>
// //                     {capturedPhotoUri ? (
// //                         <Image
// //                             source={{uri: capturedPhotoUri}}
// //                             style={[StyleSheet.absoluteFill, {transform: [{scaleX: -1}]}]}
// //                             resizeMode="cover"
// //                         />
// //                     ) : (
// //                         <Camera
// //                             ref={cameraRef}
// //                             style={StyleSheet.absoluteFill}
// //                             device={device}
// //                             isActive={!!device && !isProcessing}
// //                             photo={true}
// //                             onInitialized={() => setIsCameraInitialized(true)}
// //                         />
// //                     )}
// //
// //                     {/* Face detection overlay */}
// //                     {faces.length > 0 && !capturedPhotoUri && (
// //                         <View style={styles.faceDetectionOverlay}>
// //                             {faces.map((face, index) => {
// //                                 if (!face.bounds) return null;
// //                                 const { x, y, width, height } = face.bounds;
// //                                 return (
// //                                     <View
// //                                         key={index}
// //                                         style={[
// //                                             styles.faceBox,
// //                                             { left: x, top: y, width, height }
// //                                         ]}
// //                                     />
// //                                 );
// //                             })}
// //                         </View>
// //                     )}
// //
// //                     <Animatable.View
// //                         animation="pulse"
// //                         easing="ease-in-out"
// //                         iterationCount="infinite"
// //                         duration={1400}
// //                         style={[
// //                             styles.dottedOval,
// //                             { borderColor: faces.length > 0 ? '#4CAF50' : '#FF5722' }
// //                         ]}
// //                     />
// //                     <View style={styles.ovalBorder} pointerEvents="none"/>
// //                     <View style={styles.cornerTopLeft}/>
// //                     <View style={styles.cornerTopRight}/>
// //                     <View style={styles.cornerBottomLeft}/>
// //                     <View style={styles.cornerBottomRight}/>
// //                 </View>
// //
// //                 <View style={styles.instructionCard}>
// //                     <Text style={styles.instructionText}>
// //                         Please align your face and ensure you are in a well-lit environment.
// //                     </Text>
// //
// //                     {/* Face detection status */}
// //                     <View style={styles.faceStatusContainer}>
// //                         <View style={[
// //                             styles.faceStatusIndicator,
// //                             { backgroundColor: faces.length > 0 ? '#4CAF50' : '#FF5722' }
// //                         ]}>
// //                             <Text style={styles.faceStatusText}>
// //                                 {faces.length > 0 ? `✓ Face Detected` : '○ No Face Detected'}
// //                             </Text>
// //                         </View>
// //                     </View>
// //                 </View>
// //
// //                 {statusMessage && (
// //                     <Animatable.Text
// //                         animation="fadeIn"
// //                         duration={400}
// //                         style={styles.statusText}
// //                     >
// //                         {statusMessage}
// //                     </Animatable.Text>
// //                 )}
// //
// //                 <TouchableOpacity
// //                     style={[
// //                         styles.scanButton,
// //                         isProcessing && {opacity: 0.6},
// //                         faces.length > 0 && !isProcessing && {backgroundColor: '#4CAF50'}
// //                     ]}
// //                     onPress={handleScan}
// //                     disabled={isProcessing}
// //                 >
// //                     {isProcessing ? (
// //                         <ActivityIndicator color="#FFFFFF" size="small"/>
// //                     ) : (
// //                         <Text style={styles.scanButtonText}>
// //                             {faceExists ? 'VERIFY' : 'REGISTER'}
// //                         </Text>
// //                     )}
// //                 </TouchableOpacity>
// //             </View>
// //         </View>
// //     );
// // };
// //
// // export default BiometricScanScreen;