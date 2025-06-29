import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 340;

export const BiometricScanScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Facial Scan</Text>
        <TouchableOpacity style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Align Your Face</Text>

        {/* Face Scan Area */}
        <View style={styles.scanArea}>
          {/* Pulsing focus effect */}
          <Animatable.View
            animation="pulse"
            easing="ease-in-out"
            iterationCount="infinite"
            duration={1200}
            style={styles.dottedOval}
          />

          {/* Dotted oval face sketch */}
          {/* <View style={styles.dottedOval} /> */}

          {/* Notches
          <Animatable.View animation="fadeIn" iterationCount="infinite" duration={1600} style={styles.notchTop} />
          <Animatable.View animation="fadeIn" iterationCount="infinite" duration={1600} style={styles.notchBottom} />
          <Animatable.View animation="fadeIn" iterationCount="infinite" duration={1600} style={styles.notchLeft} />
          <Animatable.View animation="fadeIn" iterationCount="infinite" duration={1600} style={styles.notchRight} /> */}

          {/* Corner lines */}
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />

          {/* Solid oval outline */}
          <View style={styles.ovalBorder} pointerEvents="none" />
        </View>

        {/* Instruction */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            Position your face within the frame and keep still.
          </Text>
        </View>

        {/* Scan Button */}
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>SCAN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2F3E46',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#D1D5DB',
    fontSize: 18,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
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
    overflow: 'visible',
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
    borderRadius: 999,
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
    borderWidth: 4,
    borderColor: '#10877d',
    zIndex: 4,
  },
  // notchTop: {
  //   position: 'absolute',
  //   top: 8,
  //   width: 60,
  //   height: 4,
  //   backgroundColor: '#2DD4BF',
  //   borderRadius: 2,
  //   zIndex: 3,
  // },
  // notchBottom: {
  //   position: 'absolute',
  //   bottom: 8,
  //   width: 60,
  //   height: 4,
  //   backgroundColor: '#2DD4BF',
  //   borderRadius: 2,
  //   zIndex: 3,
  // },
  // notchLeft: {
  //   position: 'absolute',
  //   left: 8,
  //   width: 4,
  //   height: 60,
  //   backgroundColor: '#2DD4BF',
  //   borderRadius: 2,
  //   zIndex: 3,
  // },
  // notchRight: {
  //   position: 'absolute',
  //   right: 8,
  //   width: 4,
  //   height: 60,
  //   backgroundColor: '#2DD4BF',
  //   borderRadius: 2,
  //   zIndex: 3,
  // },
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
    backgroundColor: '#52796f',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default BiometricScanScreen;
