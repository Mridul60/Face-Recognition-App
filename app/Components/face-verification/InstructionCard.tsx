import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../(profiling)/styles-face-verification';

interface InstructionCardProps {
    faces: any[];
}

export const InstructionCard: React.FC<InstructionCardProps> = ({ faces }) => {
    let backgroundColor = '#FF5722'; // default red
    let statusText = '○ No Face Detected';

    if (faces.length === 1) {
        backgroundColor = '#4CAF50'; // green
        statusText = '✓ Face Detected';
    } else if (faces.length > 1) {
        backgroundColor = '#FF5722'; // red
        statusText = '✖ Multiple Faces Detected';
    }

    return (
        <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
                Please align your face and ensure you are in a well-lit environment.
            </Text>

            {/* Face detection status */}
            <View style={styles.faceStatusContainer}>
                <View style={[
                    styles.faceStatusIndicator,
                    { backgroundColor }
                ]}>
                    <Text style={styles.faceStatusText}>
                        {statusText}
                    </Text>
                </View>
            </View>
        </View>
    );
};
