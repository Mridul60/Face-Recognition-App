import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors'; // assuming color themes are centralized

const { width, height } = Dimensions.get('window');

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const styles = StyleSheet.create({
contentContainer: {
  flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  formSection: {
    marginTop: 20,
    gap: 8, // clean spacing between inputs, error, and button
  },
  
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
      
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    justifyContent: 'space-around',
    backgroundColor: Colors.light.background,
  },

  topSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },

  image: {
    width: 160,
    height: 160,
    marginBottom: SPACING.md,
  },

  appName: {
    paddingTop: 50,
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },

  appAbout: {
    fontSize: 22,
    color: 'gray',
    marginTop: SPACING.md,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: Math.max(16, width * 0.04),
    backgroundColor: '#fff',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingStart: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#fff',
  },

  passwordInput: {
    flex: 1,
    fontSize: Math.max(16, width * 0.04),
  },

  showHideButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },

  forgotText: {
    color: '#007AFF',
    fontSize: Math.max(14, width * 0.035),
  },

  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.lg,
  },

  separator: {
    height: SPACING.md,
  },

  googleButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: SPACING.md,
    borderRadius: 40,
    alignItems: 'center',
  },

//   formSection: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     paddingTop: SPACING.lg,
//     alignSelf: 'center',
//   },

  cameraWrapper: {
    width: '100%',
    height: height * 0.4,
    borderRadius: 16,
    overflow: 'hidden',
  },

  camera: {
    flex: 1,
  },

  registerButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: SPACING.md,
    borderRadius: 40,
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalContent: {
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      elevation: 10,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'center',
  },
  modalInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
  },
  modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  modalButton: {
      flex: 1,
      padding: 10,
      marginHorizontal: 5,
      borderRadius: 8,
      alignItems: 'center',
  },
  modalButtonText: {
      color: '#fff',
      fontWeight: '600',
  },

});

export default styles;
