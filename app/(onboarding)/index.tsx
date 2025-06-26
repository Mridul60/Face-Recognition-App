import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles';
import faceimg from '../../assets/images/face.png';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
        const router = useRouter();
    
    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <Image
                    source={faceimg}
                    style={styles.image}
                />
                <Text style={styles.appName}>FRAT</Text>
                <Text style={styles.appAbout}>
                    Face Recognition Attendance Tracking
                </Text>
            </View>

            <View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('./login')}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}onPress={() => router.push('./dashboard')}>
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.separator} />

                <TouchableOpacity style={styles.googleButton}>
                    <Text style={styles.buttonText}>Continue with Google</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
 