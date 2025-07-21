import {useEffect, useRef, useState} from 'react';
import {Camera} from 'react-native-vision-camera';
import MlkitFaceDetection from '@react-native-ml-kit/face-detection';

interface UseFaceDetectionProps {
    cameraRef: React.RefObject<Camera | null>;
    device: any;
    hasPermission: boolean;
    isCameraInitialized: boolean;
    isProcessing: boolean;
    handleScan: (faces: any[], imageUri: string) => Promise<void>;

}

export const useFaceDetection = ({
                                     cameraRef,
                                     device,
                                     hasPermission,
                                     isCameraInitialized,
                                     isProcessing,
                                     handleScan
                                 }: UseFaceDetectionProps) => {
    const [faces, setFaces] = useState<any[]>([]);
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const lastFaceCount = useRef<number>(0);
    const [isCountingDown, setIsCountingDown] = useState(false);

    const detectFaces = async () => {
        if (!cameraRef.current || isDetecting || isProcessing) return;

        try {
            setIsDetecting(true);

            const photo = await cameraRef.current.takeSnapshot({quality: 70});
            const imageUri = `file://${photo.path}`;

            const result = await MlkitFaceDetection.detect(imageUri, {
                landmarkMode: 'none',
                contourMode: 'none',
                classificationMode: 'none',
                minFaceSize: 0.1,
                performanceMode: 'fast',
            });

            const faceCount = result.length;
            setFaces(result || []);
            lastFaceCount.current = faceCount;

            if (faceCount === 1 && !timeoutRef.current) {
                setIsCountingDown(true); // start circular animation

                timeoutRef.current = setTimeout(async () => {
                    setIsCountingDown(false); // hide progress

                    const confirmPhoto = await cameraRef.current?.takeSnapshot({quality: 70});
                    if (!confirmPhoto) return;

                    const confirmUri = `file://${confirmPhoto.path}`;
                    const confirmResult = await MlkitFaceDetection.detect(confirmUri, {
                        landmarkMode: 'none',
                        contourMode: 'none',
                        classificationMode: 'none',
                        minFaceSize: 0.1,
                        performanceMode: 'fast',
                    });

                    if (confirmResult.length === 1) {
                        setCapturedImageUri(confirmUri);
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        handleScan(confirmResult, confirmUri);
                    }

                    timeoutRef.current = null;
                }, 2000);
            } else if (faceCount !== 1 && timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
                setIsCountingDown(false);
            }


        } catch (error) {
            console.error('Face detection error:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    useEffect(() => {
        if (!device || !hasPermission || !isCameraInitialized) return;

        intervalRef.current = setInterval(() => {
            detectFaces();
        }, 800);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [device, hasPermission, isCameraInitialized]);

    return {
        faces,
        capturedImageUri,
        isDetecting,
        isCountingDown,
    };
};
