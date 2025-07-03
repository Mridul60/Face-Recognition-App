import axios from 'axios';
import config from "../../config"

export const verifyFace = async (photoUri: string, userId: string): Promise<{ matched: boolean; error?: string }> => {
    const uriToBlob = async (uri: string): Promise<Blob> => {
        const response = await fetch(uri);
        return await response.blob();
    };

    try {
        const imageBlob = await uriToBlob(photoUri);
        const formData = new FormData();
        formData.append('image', imageBlob, 'face.jpg');

        const response = await fetch(config.API.FACE_MATCH(userId), {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        return { matched: data.matched };
    } catch (error) {
        console.error('Face verification error:', error);
        return { matched: false, error: 'Verification failed' };
    }
};

