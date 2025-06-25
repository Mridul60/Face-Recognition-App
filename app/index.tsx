import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';

export default function Index() {
    let is_dev_mode = false;
    const router = useRouter();

    if (is_dev_mode) {
        return <Redirect href='/views/dashboard' />;
    }
    else{
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
                        <TouchableOpacity style={styles.button}>
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
        
    
            
        }        
