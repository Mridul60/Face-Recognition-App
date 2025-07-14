import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../../config";
import { STATUS_CODES } from '@/backend/src/util/statusCodes';

export const loginUser = async (
    email: string,
    password: string
): Promise<{ success: boolean; message: string }> => {
    if (!email || !password) {
        return { success: false, message: 'Please fill in all fields' };
    }

    try {
        const response = await fetch(config.API.AUTH_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const responseText = await response.text();
        const data = JSON.parse(responseText);
        console.log('data:', data);

        const statusCode = data?.statusCode || response.status;
        const message = data?.data?.message;

        if (statusCode === STATUS_CODES.OK) {
            const userId = data.data?.id;
            if (userId) {
                await AsyncStorage.setItem('userId', String(userId));
                await AsyncStorage.setItem('userEmail', data.data.email || '');
                await AsyncStorage.setItem('userName', data.data.name || '');
            }
            return {
                success: true,
                message: data.message || 'Login successful!'
            };
        } else if (statusCode === STATUS_CODES.UNAUTHORIZED || statusCode === STATUS_CODES.NOT_FOUND) {
            return { success: false, message: message };
        } else if (statusCode === STATUS_CODES.BAD_REQUEST) {
            return { success: false, message: message || 'Missing credentials' };
        } else {
            return {
                success: false,
                message: data?.data?.message || 'Login failed. Try again.'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Network error. Please check your internet connection.'
        };
    }
};
