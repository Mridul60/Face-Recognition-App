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
          <View style={styles.ovalMask} pointerEvents="none" />
          
           {/* Spinning effect */}
         <Animatable.View
            animation="rotate"
            easing="linear"
            iterationCount="infinite"
            duration={2000}
            style={styles.spinner}
          />
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
    backgroundColor: '#000',
    position: 'relative',
  },  
  spinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: 200, // Height is taller for oval
    borderWidth: 4,
    borderTopColor: '#2DD4BF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    zIndex: 2,
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
    borderColor: '#2DD4BF',
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