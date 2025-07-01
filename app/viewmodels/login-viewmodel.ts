import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (
    email: string,
    password: string
): Promise<{ success: boolean; message: string}> => {
    if (!email || !password) {
        return { success: false, message: 'Please fill in all fields' };
    }

    try {
        const response = await fetch('http://192.168.250.22:9000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        console.log('data: ',data);
        if (response.ok) {
            const userId = data.data?.id;
            if (userId) {
                await AsyncStorage.setItem('userId', String(userId));
                await AsyncStorage.setItem('userEmail', data.data.email || '');
                await AsyncStorage.setItem('userName', data.data.name || '');
            }
            return {
                success: true,
                message: 'Login successful!',
            };
        } else {
            return { success: false, message: data.message || 'Login failed.' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Server error. Please try again later.' };
    }
};
