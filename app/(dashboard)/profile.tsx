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
    StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define colors (you should import this from your colors file)
const colors = {
    tint: '#007AFF',
    background: '#F8F9FA',
    text: '#1C1C1E',
    secondaryText: '#8E8E93',
    separator: '#E5E5EA',
    white: '#FFFFFF',
    destructive: '#FF3B30'
};

const STORAGE_KEY = 'biometricEnabled';

export default function ProfileScreen() {
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    const toggleBiometric = useCallback(async (value: boolean | ((prevState: boolean) => boolean)) => {
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

    const handleChangePassword = useCallback(() => {
        // Navigate to change password screen
        Alert.alert('Change Password', 'Navigate to change password screen');
    }, []);

    const handleLogOut = useCallback(() => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Log Out', 
                    style: 'destructive',
                    onPress: () => {
                        // Perform logout logic here
                        console.log('Logging out...');
                    }
                }
            ]
        );
    }, []);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.tint} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={'#007AFF'} />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Profile</Text>
            </View>

            <View style={styles.content}>
                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Biometric Authentication</Text>
                            <Text style={styles.settingDescription}>
                                Use fingerprint or face recognition to unlock
                            </Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={toggleBiometric}
                            trackColor={{ false: colors.separator, true: '#007AFF' }}
                            thumbColor={Platform.OS === 'ios' ? colors.white : colors.white}
                            ios_backgroundColor={colors.separator}
                        />
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.settingRow} 
                        onPress={handleChangePassword}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Change Password</Text>
                            <Text style={styles.settingDescription}>
                                Update your account password
                            </Text>
                        </View>
                        <View style={styles.chevron}>
                            <Text style={styles.chevronText}>›</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    
                    <TouchableOpacity 
                        style={[styles.settingRow, styles.destructiveRow]} 
                        onPress={handleLogOut}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, styles.destructiveText]}>
                                Log Out
                            </Text>
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
        backgroundColor: colors.background,
    },
    header: {
        height: Platform.OS === 'ios' ? 76 : 60,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        backgroundColor: '#007A3D', 
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.white,
    },

    content: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 20 : 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.secondaryText,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.secondaryText,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginHorizontal: 16,
    },
    settingRow: {
        backgroundColor: colors.white,
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.separator,
        minHeight: 60,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 17,
        fontWeight: '400',
        color: colors.text,
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        color: colors.secondaryText,
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
        color: colors.secondaryText,
        fontWeight: '300',
    },
    destructiveRow: {
        borderBottomWidth: 0,
    },
    destructiveText: {
        color: colors.destructive,
    },
});