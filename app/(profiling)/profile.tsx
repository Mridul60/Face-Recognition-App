import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    Platform,
    SafeAreaView,
    StatusBar,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { ProfileHeader } from './profile-header';
import style from '@/app/styles';
import config from "../../config";


const STORAGE_KEY = 'biometricEnabled';

export default function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors.light;

    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const loadUserEmail = async () => {
            const email = await AsyncStorage.getItem('userEmail');
            if (email) setUserEmail(email);
        };
        loadUserEmail();
    }, []);



    useEffect(() => {
        loadBiometricPreference();
    }, []);

    const loadBiometricPreference = async () => {
        try {
            const value = await AsyncStorage.getItem(STORAGE_KEY);
            if (value !== null) {
                setBiometricEnabled(value === 'true');
            }
        } catch (error) {
            console.error('Error loading biometric preference:', error);
        } finally {
            setIsLoading(false);
        }
    };


//   Logs the user out by clearing all relevant data from AsyncStorage.
    const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
    try {
        await AsyncStorage.multiRemove(['userId', 'userEmail', 'userName']);

        return {
            success: true,
            message: 'Logout successful',
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            success: false,
            message: 'Logout failed. Please try again.',
        };
    }
    };


    const toggleBiometric = useCallback(async (value: boolean) => {
        try {
            setBiometricEnabled(value);
            await AsyncStorage.setItem(STORAGE_KEY, value.toString());
            Alert.alert(
                'Biometric Authentication',
                `Biometric authentication has been ${value ? 'enabled' : 'disabled'}.`,
                [{ text: 'OK', style: 'default' }]
            );
        } catch (error) {
            console.error('Error saving biometric preference:', error);
            Alert.alert('Error', 'Failed to save preference. Please try again.');
        }
    }, []);

    const changePassword = async (
        email: string,
        oldPassword: string,
        newPassword: string
        ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await fetch(`${config.API.CHANGE_PASSWORD}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, oldPassword, newPassword }),
            });

            const data = await response.json();

            return {
                success: response.ok,
                message: data.message || 'Something went wrong.',
            };
        } catch (error) {
                console.error(error);
            return {
                success: false,
                message: 'Something went wrong. Try again.',
            };
        }
        };


    const handleChangePassword = async () => {
        const result = await changePassword(userEmail, currentPassword, newPassword);
        Alert.alert(result.success ? 'Success' : 'Error', result.message);
        if (result.success) {
            setCurrentPassword('');
            setNewPassword('');
            setShowPasswordModal(false);
        }
    };

    const handleLogOut = useCallback(() => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async() => {
                        const result = await logoutUser();
                        if (result.success){
                            console.log('Logging out...');
                            Alert.alert('Logged Out', result.message,[
                                {
                                    text: "OK",
                                    onPress: () => router.replace('/login')
                                }
                            ]);
                        } else {
                            Alert.alert('Error',result.message)
                        }
                    },
                },
            ]
        );
    }, []);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.tint} />
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.secondaryText }]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
           

        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
             {showPasswordModal && (
                <View style={style.modalOverlay}>
                    <View style={style.modalContent}>
                        <Text style={style.modalTitle}>Change Password</Text>
                        <TextInput
                            style={style.modalInput}
                            placeholder="Current Password"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <TextInput
                            style={style.modalInput}
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <View style={style.modalButtons}>
                            <TouchableOpacity
                                style={[style.modalButton, { backgroundColor: theme.icon }]}
                                onPress={() => setShowPasswordModal(false)}
                            >
                                <Text style={style.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[style.modalButton, { backgroundColor: theme.tint }]}
                                onPress={async () => {
                                    const result = await changePassword(userEmail,currentPassword, newPassword);
                                    Alert.alert(result.success ? 'Success' : 'Error', result.message);
                                    if (result.success) {
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setShowPasswordModal(false);
                                    }
                                }}
                            >
                                <Text style={style.modalButtonText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                )}
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.tint} />

          
            <ProfileHeader/>
             
            <View style={styles.content}>
                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Security</Text>

                    <View style={[styles.settingRow, { backgroundColor: theme.background, borderBottomColor: theme.icon }]}>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: theme.text }]}>Biometric Authentication</Text>
                            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                                Use fingerprint or face recognition to unlock
                            </Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={toggleBiometric}
                            trackColor={{ false: theme.icon, true: theme.tint }}
                            thumbColor={Platform.OS === 'ios' ? theme.background : theme.background}
                            ios_backgroundColor={theme.icon}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.settingRow, { backgroundColor: theme.background, borderBottomColor: theme.icon }]}
                        onPress={handleChangePassword}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: theme.text }]}>Change Password</Text>
                            <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                                Update your account password
                            </Text>
                        </View>
                        <View style={styles.chevron}>
                            <Text style={[styles.chevronText, { color: theme.secondaryText }]}>›</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Account</Text>

                    <TouchableOpacity
                        style={[styles.settingRow, styles.destructiveRow, { backgroundColor: theme.background }]}
                        onPress={handleLogOut}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: theme.destructive }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginHorizontal: 16,
    },
    settingRow: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        minHeight: 60,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 17,
        fontWeight: '400',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    chevron: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevronText: {
        fontSize: 18,
        fontWeight: '300',
    },
    destructiveRow: {
        borderBottomWidth: 0,
    },
});
