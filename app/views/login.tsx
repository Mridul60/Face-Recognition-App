import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    Alert.alert('Login Attempt', `Email: ${email}\nPassword: ${password}`);

    const userData = {
      email: email,
      password: password,
    };

    console.log('Sending this JSON to backend:', JSON.stringify(userData));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topSection}>
        <Text style={styles.title}>Log In Now</Text>
        <Text style={styles.subtitle}>Please login to continue using our app</Text>
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
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.signUpSection}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.05, // 5% of screen width
  },
  topSection: {
    flex: 1,
    // backgroundColor: '#f8f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.06, // 8% of screen height
    minHeight: height * 0.1, // Minimum 40% of screen height
  },
  title: {
    fontSize: width * 0.06, // 6% of screen width
    backgroundColor: 'DodgerBlue',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: width * 0.035, // 3.5% of screen width
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
  formSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: height * 0.05,
    maxWidth: 400, // Max width for tablets
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    height: Math.max(50, height * 0.06), // Minimum 50px or 6% of height
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: height * 0.02,
    fontSize: Math.max(16, width * 0.04), // Minimum 16px or 4% of width
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: Math.max(50, height * 0.06),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: height * 0.02,
  },
  passwordInput: {
    flex: 1,
    fontSize: Math.max(16, width * 0.04),
  },
  showText: {
    color: '#007AFF',
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
  loginButton: {
    width: '100%',
    height: Math.max(50, height * 0.06),
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: Math.max(16, width * 0.04),
    fontWeight: 'bold',
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },
  signUpText: {
    color: '#666',
    fontSize: Math.max(14, width * 0.035),
  },
  signUpLink: {
    color: '#007AFF',
    fontSize: Math.max(14, width * 0.035),
    fontWeight: 'bold',
  },
});