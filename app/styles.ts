import {Dimensions, StyleSheet} from "react-native";
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-around',
    },
    topSection: {
        alignItems: 'center',
        marginTop: 60,
    },
    image: {
        width: 160,
        height: 160,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    appAbout: {
        fontSize: 22,
        color: 'gray',
        marginTop: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 30,
    },
    button: {
        flex: 1,
        backgroundColor: 'green',
        padding: 16,
        borderRadius: 40,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    separator: {
        height: 16,
    },
    googleButton: {
        backgroundColor: 'green',
        padding: 16,
        borderRadius: 40,
        alignItems: 'center',
    },
    formSection: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 20,
        alignSelf: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
        fontSize: Math.max(16, width * 0.04),
    },
    passwordContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        paddingStart: 16,
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        fontSize: Math.max(16, width * 0.04),
    },
    showHideButton: {
        padding: 12,
        fontSize: Math.max(14, width * 0.035),
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: height * 0.04,
    },
    forgotText: {
        color: '#007AFF',
        fontSize: Math.max(14, width * 0.035),
    },
});

export default styles;