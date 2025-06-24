import React from 'react';


import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';


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

const Separator = () => <View style={styles.separator}/>;

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
        fontWeight: 'bold'
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
    }
});
