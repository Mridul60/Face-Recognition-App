// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const db = require('../../config/dbConfig');
const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');

const faceRegistrationService = () => {
    return async function faceRegistrationHandler(httpRequest) {
        const userId = httpRequest?.pathParams?.userId;
        const file = httpRequest?.file;

        if (!userId) {
            return {
                statusCode: 400,
                body: {success: false, message: 'Missing userId in request params'}
            };
        }

        if (!file || !file.path) {
            return {
                statusCode: 400,
                body: {success: false, message: 'Image file is required'}
            };
        }

        const imagePath = file.path;
        console.log("imagePath: ", imagePath);

        try {
            // Run Python script
            const pythonScriptPath = path.join(__dirname, '../../python/register_face.py');
            const pythonProcess = spawn('python', [pythonScriptPath, imagePath, userId]);

            let encoding = '';
            const errorOutput = [];

            for await (const chunk of pythonProcess.stdout) {
                encoding += chunk.toString();
            }

            for await (const chunk of pythonProcess.stderr) {
                errorOutput.push(chunk.toString());
            }

            const exitCode = await new Promise(resolve => pythonProcess.on('close', resolve));

            if (exitCode !== 0) {
                return {
                    statusCode: 500,
                    body: {
                        success: false,
                        message: 'Face processing failed',
                        error: errorOutput.join('')
                    }
                };
            }

            encoding = encoding.trim(); // just in case

            // const query = `
            //     INSERT INTO face_data (employeeID, face_encoding)
            //     VALUES (?, ?) ON DUPLICATE KEY
            //     UPDATE face_encoding = ?
            // `;
            // await db.query(query, [userId, encoding, encoding]);

            return {
                statusCode: 200,
                body: {success: true, message: 'Face encoding stored successfully'}
            };
        } catch (error) {
            console.error('Registration Error:', error);
            return {
                statusCode: 500,
                body: {success: false, message: 'Internal server error'}
            };
        } finally {
            fs.unlink(imagePath, () => {
            }); // cleanup image
        }
    };
};

module.exports = faceRegistrationService;
