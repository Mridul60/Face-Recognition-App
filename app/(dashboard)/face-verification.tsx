import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Close icon
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
        <Text style={styles.title}>Scan Face</Text>

        {/* Scanning Oval Area with Camera */}
        <View style={styles.scanWrapper}>
          {/* <Camera
            ref={cameraRef}
            style={styles.camera}
            type={CameraType.front}
          /> */}

            <Animatable.View
              animation="pulse"
              easing="ease-in-out"
              iterationCount="infinite"
              duration={1200}
              style={styles.pulseOval}
            />

            <View style={styles.notchTop} />
            <View style={styles.notchBottom} />

          <View style={styles.ovalMask} pointerEvents="none" />

        </View>

        
        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.instructionText}>
            Align your face inside the oval frame
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

const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 340;

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
  scanWrapper: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: OVAL_WIDTH / 2,
    backgroundColor: '#fff',
    position: 'relative',
  },  
  pulseOval: {
    position: 'absolute',
    width: OVAL_WIDTH - 100, // slightly smaller than mask
    height: OVAL_HEIGHT - 70,
    borderRadius: 210, // keep this high to simulate oval
    borderWidth: 2,
    borderColor: '#2DD4BF',
    backgroundColor: 'rgba(45, 212, 191, 0.07)',
    zIndex: 1,
  },
notchTop: {
  position: 'absolute',
  top: 8,
  width: 60,
  height: 4,
  backgroundColor: '#2DD4BF',
  borderRadius: 2,
  zIndex: 10,
},

notchBottom: {
  position: 'absolute',
  bottom: 8,
  width: 60,
  height: 4,
  backgroundColor: '#2DD4BF',
  borderRadius: 2,
  zIndex: 10,
},

  
  
  camera: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
  },
  ovalMask: {
    position: 'absolute',
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderWidth: 4,
    borderColor: '#10877d',
    borderRadius: OVAL_WIDTH / 2,
  },
  card: {
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
    backgroundColor: '#2DD4BF',
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