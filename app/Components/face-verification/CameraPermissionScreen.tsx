// components/CameraPermissionScreen.tsx
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from '../../(profiling)/styles-face-verification'

interface CameraPermissionScreenProps {
    onRequestPermission: () => void;
}

export const CameraPermissionScreen: React.FC<CameraPermissionScreenProps> = ({onRequestPermission,}) => {
    return (
        <View style={styles.centered}>
            <Text>No camera access</Text>
            <TouchableOpacity onPress={onRequestPermission} style={styles.scanButton}>
                <Text style={styles.scanButtonText}>Grant Permission</Text>
            </TouchableOpacity>
        </View>
    );
};