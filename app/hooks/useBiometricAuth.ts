import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from 'expo-router';
import {Alert} from "react-native";

export const useBiometricAuth = (
    isPunchedIn: boolean,
    isWithinOffice: boolean
) => {
    const handleBiometricAuth = async (): Promise<boolean> => {
        try {
            if (!isWithinOffice) {
                Alert.alert('Location Error', 'You are outside the office boundary.');
                return false;
            }
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                return false;
            }
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to Punch Attendance',
                fallbackLabel: 'Use PIN',
            });

            return result.success;
        } catch (error) {
            console.error('Biometric auth error:', error);
            return false;
        }
    };

    return {handleBiometricAuth};
};
