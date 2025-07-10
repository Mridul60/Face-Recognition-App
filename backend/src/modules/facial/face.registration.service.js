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



// const db = require('../../config/dbConfig');
// const { spawn } = require('child_process');
// const path = require('path');
// const fs = require('fs');
//
// const FaceRegistrationService = () => {
//     return async function faceRegistrationHandler(httpRequest) {
//         const serviceStartTime = Date.now();
//         console.log('REGISTER_SERVICE: Starting face registration service...');
//
//         // Input validation timing
//         const validationStartTime = Date.now();
//         const userId = httpRequest?.pathParams?.userId;
//         const file = httpRequest?.file;
//
//         if (!userId) {
//             const validationDuration = Date.now() - validationStartTime;
//             console.log(`REGISTER_SERVICE: Validation failed (missing userId) in ${validationDuration}ms`);
//             return {
//                 statusCode: 400,
//                 body: { success: false, message: 'Missing userId in request params' }
//             };
//         }
//
//         if (!file || !file.path) {
//             const validationDuration = Date.now() - validationStartTime;
//             console.log(`REGISTER_SERVICE: Validation failed (missing file) in ${validationDuration}ms`);
//             return {
//                 statusCode: 400,
//                 body: { success: false, message: 'Image file is required' }
//             };
//         }
//
//         const validationDuration = Date.now() - validationStartTime;
//         console.log(`REGISTER_SERVICE: Input validation completed in ${validationDuration}ms`);
//         console.log(`REGISTER_SERVICE: Processing userId: ${userId}, file: ${file.filename} (${file.size} bytes)`);
//
//         const imagePath = file.path;
//
//         try {
//             // Python script setup timing
//             const scriptSetupStartTime = Date.now();
//             const pythonScriptPath = path.join(__dirname, '../../python/register_face.py');
//             console.log(`REGISTER_SERVICE: Python script path: ${pythonScriptPath}`);
//
//             const scriptSetupDuration = Date.now() - scriptSetupStartTime;
//             console.log(`REGISTER_SERVICE: Script setup completed in ${scriptSetupDuration}ms`);
//
//             // Python process spawn timing
//             const spawnStartTime = Date.now();
//             console.log(`REGISTER_SERVICE: Spawning Python process with args: [${pythonScriptPath}, ${imagePath}, ${userId}]`);
//
//             const pythonProcess = spawn('python', [pythonScriptPath, imagePath, userId]);
//             const spawnDuration = Date.now() - spawnStartTime;
//             console.log(`REGISTER_SERVICE: Python process spawned in ${spawnDuration}ms`);
//
//             // Data collection timing
//             const dataCollectionStartTime = Date.now();
//             let encoding = '';
//             const errorOutput = [];
//
//             console.log('REGISTER_SERVICE: Starting stdout/stderr collection...');
//
//             // Collect stdout
//             const stdoutStartTime = Date.now();
//             for await (const chunk of pythonProcess.stdout) {
//                 encoding += chunk.toString();
//             }
//             const stdoutDuration = Date.now() - stdoutStartTime;
//             console.log(`REGISTER_SERVICE: Stdout collection completed in ${stdoutDuration}ms`);
//             console.log(`REGISTER_SERVICE: Stdout content length: ${encoding.length} characters`);
//
//             // Collect stderr
//             const stderrStartTime = Date.now();
//             for await (const chunk of pythonProcess.stderr) {
//                 errorOutput.push(chunk.toString());
//             }
//             const stderrDuration = Date.now() - stderrStartTime;
//             console.log(`REGISTER_SERVICE: Stderr collection completed in ${stderrDuration}ms`);
//
//             const dataCollectionDuration = Date.now() - dataCollectionStartTime;
//             console.log(`REGISTER_SERVICE: Total data collection completed in ${dataCollectionDuration}ms`);
//
//             // Process exit timing
//             const exitWaitStartTime = Date.now();
//             console.log('REGISTER_SERVICE: Waiting for Python process to exit...');
//
//             const exitCode = await new Promise(resolve => pythonProcess.on('close', resolve));
//             const exitWaitDuration = Date.now() - exitWaitStartTime;
//             console.log(`REGISTER_SERVICE: Python process exited with code ${exitCode} in ${exitWaitDuration}ms`);
//
//             // Result processing timing
//             const resultProcessingStartTime = Date.now();
//
//             if (exitCode !== 0) {
//                 console.log(`REGISTER_SERVICE: Python process failed with exit code: ${exitCode}`);
//                 console.log(`REGISTER_SERVICE: Error output: ${errorOutput.join('')}`);
//
//                 const resultProcessingDuration = Date.now() - resultProcessingStartTime;
//                 console.log(`REGISTER_SERVICE: Error result processing completed in ${resultProcessingDuration}ms`);
//
//                 const totalServiceDuration = Date.now() - serviceStartTime;
//                 console.log(`REGISTER_SERVICE: Total service execution (FAILED) in ${totalServiceDuration}ms`);
//
//                 return {
//                     statusCode: 500,
//                     body: {
//                         success: false,
//                         message: 'Face processing failed',
//                         error: errorOutput.join('')
//                     }
//                 };
//             }
//
//             const resultProcessingDuration = Date.now() - resultProcessingStartTime;
//             console.log(`REGISTER_SERVICE: Success result processing completed in ${resultProcessingDuration}ms`);
//
//             if (encoding.trim()) {
//                 console.log('REGISTER_SERVICE: Python script output:');
//                 console.log(encoding);
//             }
//
//             const totalServiceDuration = Date.now() - serviceStartTime;
//             console.log(`REGISTER_SERVICE: Total service execution (SUCCESS) in ${totalServiceDuration}ms`);
//
//             return {
//                 statusCode: 200,
//                 body: { success: true, message: 'Face encoding stored successfully' }
//             };
//
//         } catch (error) {
//             const errorDuration = Date.now() - serviceStartTime;
//             console.log(`REGISTER_SERVICE: Service error after ${errorDuration}ms:`, error.message);
//             console.error('Registration Error:', error);
//
//             return {
//                 statusCode: 500,
//                 body: { success: false, message: 'Internal server error' }
//             };
//         } finally {
//             // Cleanup timing
//             const cleanupStartTime = Date.now();
//             console.log(`REGISTER_SERVICE: Starting file cleanup for: ${imagePath}`);
//
//             fs.unlink(imagePath, (err) => {
//                 const cleanupDuration = Date.now() - cleanupStartTime;
//                 if (err) {
//                     console.log(`REGISTER_SERVICE: File cleanup failed in ${cleanupDuration}ms:`, err.message);
//                 } else {
//                     console.log(`REGISTER_SERVICE: File cleanup completed in ${cleanupDuration}ms`);
//                 }
//             });
//         }
//     };
// };
//
// module.exports = FaceRegistrationService;
