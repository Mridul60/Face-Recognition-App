// components/StatusMessage.tsx
import React from 'react';
import * as Animatable from 'react-native-animatable';
import styles from '../../(profiling)/styles-face-verification'

interface StatusMessageProps {
    statusMessage: string | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({statusMessage}) => {
    if (!statusMessage) return null;

    return (
        <Animatable.Text
            animation="fadeIn"
            duration={400}
            style={styles.statusText}
        >
            {statusMessage}
        </Animatable.Text>
    );
};