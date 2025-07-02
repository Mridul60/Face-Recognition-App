import { Alert } from 'react-native';
import {
    requestForegroundPermissionsAsync,
    getCurrentPositionAsync,
    Accuracy,
    LocationObjectCoords,
} from 'expo-location';
import { checkIfWithinOffice } from '../utils/locationUtils';

type LocationType = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

export const useCurrentLocation = (
    officeLocation: LocationType,
    officeRadius: number,
    setIsWithinOffice: (inside: boolean) => void,
    setCurrentLocation: (loc: LocationType) => void
) => {
    const getCurrentLocation = async () => {
        const { status } = await requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location permission is required.');
            return;
        }

        const location = await getCurrentPositionAsync({ accuracy: Accuracy.Highest });
        const { latitude, longitude }: LocationObjectCoords = location.coords;

        const newLocation: LocationType = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };

        setCurrentLocation(newLocation);
        checkIfWithinOffice(latitude, longitude, officeLocation, officeRadius, setIsWithinOffice);
    };

    return { getCurrentLocation };
};
