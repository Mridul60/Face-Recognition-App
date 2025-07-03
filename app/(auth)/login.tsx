import React from "react";
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import faceimage from '../../assets/images/face.png';
import { loginUser } from '../viewmodels/login-viewmodel';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const {width, height} = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage('Please fill all fields');
            return;
        }
        if (!isValidEmail(email)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        const result = await loginUser(email, password);
        setIsLoading(false);

        if (result.success) {
            // Get stored userId
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                setErrorMessage('Something went wrong. Please try again.');
                return;
            }

            // Check if facial descriptor exists
            try {
                const checkRes = await fetch(`http://192.168.195.5:9000/face/isAvailable/${userId}`);
                const checkData = await checkRes.json();
                if (checkRes.ok && checkData.body.exists) {
                    router.replace('/(dashboard)');
                } else {
                    router.replace('/face-verification');
                }
            } catch (error) {
                console.error('Descriptor check failed:', error);
                setErrorMessage('Server error while checking facial data.');
            }
        } else {
            setErrorMessage(result.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
           
             <View style={[styles.container, { justifyContent: 'flex-start' }]}>
                <View style={styles.topSection}>
                <Image
                    source={faceimage}
                    style={styles.image}
                />
                <Text style={[styles.appName]}> Log in</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.showHideButton} onPress={togglePasswordVisibility}>
                    <Text>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Error message */}
            <View style={{ height: 20, justifyContent: 'center', alignItems: 'center' }}>
                {errorMessage !== '' && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>
                        {errorMessage}
                    </Text>
                )}
            </View>

            {/* Login button or loader */}
            <TouchableOpacity
                style={[styles.button, { flex: 0, margin: 30, opacity: isLoading ? 0.6 : 1 }]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Log in</Text>
                )}
            </TouchableOpacity>
        </View>
                </KeyboardAvoidingView>
        
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-around',
    },
    topSection: {
        alignItems: 'center',
        marginTop: 60,
    },
    image: {
        width: 160,
        height: 160,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    appAbout: {
        fontSize: 22,
        color: 'gray',
        marginTop: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 30,
    },
    button: {
        flex: 1,
        backgroundColor: 'green',
        padding: 16,
        borderRadius: 40,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    separator: {
        height: 16,
    },
    googleButton: {
        backgroundColor: 'green',
        padding: 16,
        borderRadius: 40,
        alignItems: 'center',
    },
    formSection: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 20,
        alignSelf: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: Math.max(16, width * 0.04),
    },
    passwordContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        paddingStart: 16,
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        fontSize: Math.max(16, width * 0.04),
    },
    showHideButton: {
        padding: 12,
        fontSize: Math.max(14, width * 0.035),
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: height * 0.04,
    },
    forgotText: {
        color: '#007AFF',
        fontSize: Math.max(14, width * 0.035),
    },
    cameraWrapper: {
        width: '100%',
        height: 300, // partial screen height
        borderRadius: 16,
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    registerButton: {
        // flex: 1,
        backgroundColor: 'green',
        padding: 16,
        borderRadius: 40,
        alignItems: 'center',
    },
});
