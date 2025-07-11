import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';

interface MapSectionProps {
    mapRef: any;
    currentLocation: any;
    officeLocation: any;
    officeRadius: number;
    styles: any;
}

const MapSection: React.FC<MapSectionProps> = ({
                                                   mapRef,
                                                   currentLocation,
                                                   officeLocation,
                                                   officeRadius,
                                                   styles,
                                               }) => {
    return (
        <View style={styles.mapWrapper}>
            {currentLocation ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={currentLocation}
                    showsUserLocation
                    onMapReady={() => {
                        if (mapRef.current) {
                            mapRef.current.animateToRegion(
                                {
                                    ...currentLocation,
                                    latitudeDelta: 0.001,
                                    longitudeDelta: 0.001,
                                },
                                800
                            );
                        }
                    }}
                >
                    <Marker coordinate={officeLocation} pinColor="#0c924b" title="Office" />
                    <Circle
                        center={officeLocation}
                        radius={officeRadius}
                        strokeColor="#3B82F6"
                        fillColor="rgba(59,130,246,0.1)"
                    />
                    <Marker coordinate={currentLocation} pinColor="red" title="You" />
                </MapView>
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text>Loading map...</Text>
                </View>
            )}
        </View>
    );
};

export default MapSection;
