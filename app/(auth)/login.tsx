import React from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '../styles';
import faceimage from '../../assets/images/face.png';
import { loginUser } from '../viewmodels/login-viewmodel';
import { useRouter } from "expo-router";

export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage('Please fill all fields');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        const result = await loginUser(email, password);
        setIsLoading(false);

        if (result.success) {
            router.replace('/(dashboard)'); // ✅ this points to /app/(dashboard)/index.tsx
        } else {
            setErrorMessage(result.message);
        }
    };

    return (
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

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text> New user?</Text>
                <TouchableOpacity>
                    <Text>Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
