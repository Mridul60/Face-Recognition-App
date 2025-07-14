import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

export const toastConfig = {
    success: ({ text1, text2 }: BaseToastProps) => (
        <View style={[styles.toastContainer, { borderLeftColor: '#4CAF50' }]}>
            <Text style={styles.title}>{text1}</Text>
            {text2 ? <Text style={styles.message}>{text2}</Text> : null}
        </View>
    ),
    error: ({ text1, text2 }: BaseToastProps) => (
        <View style={[styles.toastContainer, { borderLeftColor: '#F44336' }]}>
            <Text style={styles.title}>{text1}</Text>
            {text2 ? <Text style={styles.message}>{text2}</Text> : null}
        </View>
    ),
};

const styles = StyleSheet.create({
    toastContainer: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderLeftWidth: 6,
        marginHorizontal: 10,
        marginTop: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    message: {
        marginTop: 4,
        fontSize: 14,
        color: '#555',
    },
});
