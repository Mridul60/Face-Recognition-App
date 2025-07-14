import {Stack} from 'expo-router';
import {StatusBar} from 'react-native';
import React, {useEffect} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import {toastConfig} from "@/app/config/toastConfig";
// Prevent the splash screen from auto-hiding before asset loading is complete
// SplashScreen.preventAutoHideAsync();

export default function DashboardLayout() {
    useEffect(() => {
        StatusBar.setHidden(true, 'slide');
        return () => StatusBar.setHidden(false); // show it back on unmount if needed
    }, []);

    return (
        <>
            <Stack screenOptions={{headerShown: false,}}/>
            <Toast config={toastConfig}/>
        </>
    );
}

