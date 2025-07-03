import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from 'expo-router';
import {Alert} from "react-native";

export const useBiometricAuth = (
    isPunchedIn: boolean,
    isWithinOffice: boolean,
    handlePunchAction: Function
) => {
    const handleBiometricAuth = async () => {
        if (!isWithinOffice) {
            Alert.alert('Location Error', 'You are outside the office boundary.');
            return;
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            return Alert.alert('Unavailable', 'Biometric auth not available.');
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: `Punch ${isPunchedIn ? 'Out' : 'In'}`,
            fallbackLabel: 'Use PIN',
        });

        if (result.success) {
            router.push('/face-verification');
            // const userId = await AsyncStorage.getItem('userId');
            // const response = await fetch(`http://192.168.195.5:9000/facial/check/${userId}`);
            // const data = await response.json();
            // console.log("data: ", data);
            // handlePunchAction();
        } else {
            Alert.alert('Authentication Failed');
        }
    };

    return {handleBiometricAuth};
};
