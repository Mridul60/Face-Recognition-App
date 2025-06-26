import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from './styles';

export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <View style={[styles.container, {justifyContent: 'flex-start'}]}>
            <View style={styles.topSection}>
                <Image
                    source={require('../assets/images/face.png')}
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
            <TouchableOpacity style={[styles.button, {flex: 0, margin: 30}]}>
                <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text> New user?</Text>
                <TouchableOpacity>
                    <Text>Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
}