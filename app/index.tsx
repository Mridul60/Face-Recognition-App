import React from 'react';
import {View, Text, Image, StyleSheet, Button} from 'react-native';
import {Link} from "expo-router"

export default function Index() {
    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <Image
                    source={require('../assets/images/face.png')}
                    style={styles.image}
                />
                <Text style={styles.text}>FRAT</Text>
                <Text style={styles.text}>Face Recognition Geo-Location based Attendance</Text>

            </View>
            <Separator/>
            <View style={styles.section}>
                <View style={styles.leftRight}>
                    <Button
                        title="Login"
                    />
                    <Button
                        title="Register"
                    />
                </View>
                <Separator/>
                <Button title={"Continue with Google"}>

                </Button>
            </View>
        </View>
    );
}

const Separator = () => <View style={styles.separator}/>;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'cyan',
        padding: 16,
    },
    topSection: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
    },
    section: {
        marginBottom: 20,
        // backgroundColor: 'red',,
    },
    image: {
        width: 200,
        height: 200,
        alignSelf: 'center',
    },
    text: {
        fontSize: 18,
        textAlign: 'center',
    },
    leftRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    separator: {
        marginVertical: 8
    },
});
