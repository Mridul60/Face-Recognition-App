import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import config from "../../config";
import styles from "../styles";
import { loginUser } from '../viewmodels/login-viewmodel';
import Logo from '@/assets/icons/green-logo.svg'

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  // Email Validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Toggle password 
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Login logic 
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill all the fields');
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
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setErrorMessage('Something went wrong. Please try again.');
        return;
      }

      try {
        const checkRes = await fetch(config.API.IS_AVAILABLE(userId));
        const checkData = await checkRes.json();
        if (checkRes.ok && checkData.body.exists) {
          router.replace('/dashboard');
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
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <Logo width={320} height={110} />

          <Text style={styles.appName}>Log in</Text>
        </View>

        <View style={styles.formSection}>
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

          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, { opacity: isLoading ? 0.6 : 1 }]}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
