import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    useEffect(() => {
        // Load saved preference on mount
        const loadBiometricPreference = async () => {
            const value = await AsyncStorage.getItem('biometricEnabled');
            if (value !== null) {
                setBiometricEnabled(value === 'true');
            }
        };
        loadBiometricPreference();
    }, []);

    const toggleBiometric = async (value: boolean) => {
        setBiometricEnabled(value);
        await AsyncStorage.setItem('biometricEnabled', value.toString());
        Alert.alert('Biometric Auth', value ? 'Enabled' : 'Disabled');
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.text}>Use Biometric Authentication</Text>
                <Switch
                    value={biometricEnabled}
                    onValueChange={toggleBiometric}
                />
            </View>

            <TouchableOpacity>
                <Text style={styles.text}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text style={styles.text}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 100,
        paddingHorizontal: 20,
    },
    text: {
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
});
