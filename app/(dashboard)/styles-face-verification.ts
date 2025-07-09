import {Dimensions, Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '@/constants/Colors';
import React from 'react';
import {useColorScheme} from '@/hooks/useColorScheme';

const {width} = Dimensions.get('window');
const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 340;
const colors = Colors['light']; // only light mode for now
  
const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        height: Platform.OS === 'ios' ? 76 : 60,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        backgroundColor: colors.tint,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        color: '#D1D5DB',
        fontSize: 18,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
        paddingHorizontal: 12
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        color: '#1F2937',
    },
    scanArea: {
        width: OVAL_WIDTH,
        height: OVAL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: OVAL_WIDTH / 2,
        overflow: 'hidden',
        position: 'relative',
    },
    pulseOverlay: {
        position: 'absolute',
        width: OVAL_WIDTH - 80,
        height: OVAL_HEIGHT - 50,
        borderRadius: 200,
        borderWidth: 2,
        borderColor: '#2DD4BF',
        backgroundColor: 'rgba(45, 212, 191, 0.08)',
        zIndex: 1,
    },
    dottedOval: {
        position: 'absolute',
        width: OVAL_WIDTH - 60,
        height: OVAL_HEIGHT - 80,
        borderRadius: OVAL_WIDTH / 2,
        borderWidth: 1.5,
        borderColor: '#2DD4BF',
        backgroundColor: 'rgba(45, 212, 191, 0.08)',
        borderStyle: 'dotted',
        zIndex: 2,
    },
    ovalBorder: {
        position: 'absolute',
        width: OVAL_WIDTH,
        height: OVAL_HEIGHT,
        borderRadius: OVAL_WIDTH / 2,
        borderWidth: 3,
        borderColor: '#10877d',
        zIndex: 3,
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#2DD4BF',
        zIndex: 5,
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 30,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: '#2DD4BF',
        zIndex: 5,
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#2DD4BF',
        zIndex: 5,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: '#2DD4BF',
        zIndex: 5,
    },
    instructionCard: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
    },
    instructionText: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center',
    },
    scanButton: {
        backgroundColor: Colors['light'].tint,
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 8,
    },
    scanButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    statusText: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '600',
    },
    retryHint: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
        color: 'red',
    },

    retakeButton: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },

    retakeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

});

export default styles;