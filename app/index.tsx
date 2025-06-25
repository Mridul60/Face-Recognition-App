import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import styles from './styles'

export default function Index() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <Image
                    source={require('../assets/images/face.png')}
                    style={styles.image}
                />
                <Text style={styles.appName}>FRAT</Text>
                <Text style={styles.appAbout}>
                    Face Recognition Attendance Tracking
                </Text>
            </View>

            <View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/views/login')}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={()=> router.push('/views/register')}>
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

const Separator = () => <View style={styles.separator}/>;

