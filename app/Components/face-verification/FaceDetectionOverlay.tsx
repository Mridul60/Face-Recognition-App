// components/FaceDetectionOverlay.tsx
import React from 'react';
import {View} from 'react-native';
import styles from '../../(profiling)/styles-face-verification'

interface FaceDetectionOverlayProps {
    faces: any[];
    capturedPhotoUri: string | null;
}

export const FaceDetectionOverlay: React.FC<FaceDetectionOverlayProps> = ({
                                                                              faces,
                                                                              capturedPhotoUri,
                                                                          }) => {
    if (faces.length === 0 || capturedPhotoUri) return null;

    return (
        <View style={styles.faceDetectionOverlay}>
            {faces.map((face, index) => {
                if (!face.bounds) return null;
                const { x, y, width, height } = face.bounds;
                return (
                    <View
                        key={index}
                        style={[
                            styles.faceBox,
                            { left: x, top: y, width, height }
                        ]}
                    />
                );
            })}
        </View>
    );
};