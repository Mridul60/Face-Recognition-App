import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import faceimg from '../../assets/images/face.png';
import styles from '../styles';
import { registerUser } from '../viewmodels/register-viewmodel';


export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }
    return (
        <View style={[styles.container, {justifyContent: 'flex-start'}]}>
            <View style={styles.topSection}>
                <Image
                    source={faceimg}
                    style={styles.image}
                />
                <Text style={styles.appName}>Register</Text>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                keyboardType="default"
                autoCapitalize="none"
            />
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
            <TouchableOpacity style={styles.registerButton} onPress={async () => {
                const result = await registerUser(fullName, email, password);
                alert(result.message);
            }}
            >
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

        </View>
    );
}

