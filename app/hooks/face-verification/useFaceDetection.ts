// hooks/useFaceDetection.ts
import {useEffect, useState} from 'react';
import {Camera} from 'react-native-vision-camera';
import MlkitFaceDetection from '@react-native-ml-kit/face-detection';

interface UseFaceDetectionProps {
    cameraRef: React.RefObject<Camera | null>;
    device: any;
    hasPermission: boolean;
    isCameraInitialized: boolean;
    isProcessing: boolean;
}

export const useFaceDetection = ({
                                     cameraRef,
                                     device,
                                     hasPermission,
                                     isCameraInitialized,
                                     isProcessing,
                                 }: UseFaceDetectionProps) => {
    const [faces, setFaces] = useState<any[]>([]);
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);


    const detectFaces = async () => {
        if (!cameraRef.current || isDetecting || isProcessing) return;

        try {
            setIsDetecting(true);

            // const photo = await cameraRef.current.takePhoto({});

            const photo = await cameraRef.current.takeSnapshot({
                quality: 70, // Lower quality = faster processing
            });
            // Convert the path to a URI
            const imageUri = `file://${photo.path}`;

            // Store the image URI
            setCapturedImageUri(imageUri);

            const result = await MlkitFaceDetection.detect(imageUri, {
                landmarkMode: 'none',
                contourMode: 'none',
                classificationMode: 'none',
                minFaceSize: 0.1,
                performanceMode: 'fast',
            });

            setFaces(result || []);
        } catch (error) {
            console.error('Face detection error:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    // Real-time face detection
    useEffect(() => {
        if (!device || !hasPermission || !isCameraInitialized) return;

        const interval = setInterval(() => {
            detectFaces();
        }, 800);

        return () => clearInterval(interval);
    }, [device, hasPermission, isCameraInitialized]);

    return {
        faces,
        capturedImageUri,
        isDetecting,
    };
};