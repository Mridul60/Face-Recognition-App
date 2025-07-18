// hooks/useBackHandler.ts
import {useEffect} from 'react';
import {BackHandler} from 'react-native';

export const useBackHandler = (isProcessing: boolean) => {
    useEffect(() => {
        const onBackPress = () => {
            if (isProcessing) {
                return true; // Disable back button when processing
            }
            return false; // Allow default back behavior
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [isProcessing]);
};