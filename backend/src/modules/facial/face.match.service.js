const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const PunchService = require('../attendance/punch.service');
const CustomError = require('../../util/error');
const punchHandler = PunchService({ CustomError, env: process.env });
const db = require('../../config/dbConfig');

const faceMatchService = () => {
    return async function faceMatchHandler(httpRequest) {
        const file = httpRequest?.file;
        const userId = httpRequest?.pathParams?.userId;
        const mode = httpRequest?.queryParams?.punchInOrPunchOut;

        if (!file || !file.path) {
            console.log("No file provided");
            return {
                statusCode: 400,
                body: { success: false, message: 'Image file is required' }
            };
        }

        const imagePath = file.path;
        const pythonScriptPath = path.join(__dirname, '../../python/match_face.py');

        console.log("Image Path:", imagePath);
        console.log("Python Script Path:", pythonScriptPath);

        try {
            const pythonProcess = spawn('python', [pythonScriptPath, imagePath, userId]);

            let output = '';
            const errorOutput = [];

            for await (const chunk of pythonProcess.stdout) {
                const text = chunk.toString();
                output += text;
                console.log("Python STDOUT:", text.trim());
            }

            for await (const chunk of pythonProcess.stderr) {
                const errorText = chunk.toString();
                errorOutput.push(errorText);
                console.error("Python STDERR:", errorText.trim());
            }

            const exitCode = await new Promise(resolve => pythonProcess.on('close', resolve));
            console.log("Python process exited with code:", exitCode);

            let parsed;
            try {
                const jsonLine = output
                    .trim()
                    .split('\n')
                    .find(line => {
                        try {
                            JSON.parse(line);
                            return true;
                        } catch {
                            return false;
                        }
                    });

                if (!jsonLine) {
                    throw new Error('No valid JSON found in Python output');
                }

                parsed = JSON.parse(jsonLine);
                console.log("Parsed JSON:", parsed);
            } catch (err) {
                console.error("JSON parsing error:", err.message);
                return {
                    statusCode: 500,
                    body: {
                        success: false,
                        message: 'Invalid response from face matching script',
                        error: err.message,
                    }
                };
            }
            if (exitCode !== 0) {
                return {
                    statusCode: 500,
                    body: {
                        success: false,
                        message: parsed?.error || 'Face matching script failed',
                        error: errorOutput.join('')
                    }
                };
            }

            if (parsed.matched) {
                const employeeID = userId;
                const now = new Date();
                const date = now.toISOString().split('T')[0];
                const time = now.toTimeString().split(' ')[0];

                let punchBody = {
                    employeeID,
                    date
                };

                if (mode === 'punchIn') {
                    punchBody.punch_in_time = time;
                } else {
                    punchBody.punch_out_time = time;
                }

                const punchRequest = { body: punchBody };
                console.log("Punch request body:", punchRequest);

                const punchResult = await punchHandler(punchRequest);
                console.log("Punch result:", punchResult);

                return {
                    statusCode: 200,
                    body: {
                        matched: true,
                        user_id: employeeID,
                        message: punchResult.message
                    }
                };
            } else {
                console.log("Face not matched or user_id missing");
                return {
                    statusCode: 401,
                    body: {
                        matched: false,
                        message: 'Face not matched'
                    }
                };
            }

        } catch (error) {
            console.error("Internal error:", error.message);
            return {
                statusCode: 500,
                body: { success: false, message: 'Internal Server Error' }
            };
        } finally {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Error deleting image:", err);
                else console.log("Temp image deleted");
            });
        }
    };
};

module.exports = faceMatchService;


// const faceMatchService = () => {
//     return async function faceMatchHandler(httpRequest) {
//         const serviceStartTime = Date.now();
//         console.log("MATCH_SERVICE: faceMatchHandler invoked");
//
//         const file = httpRequest?.file;
//         const userId = httpRequest?.pathParams?.userId;
//         const mode = httpRequest?.queryParams?.punchInOrPunchOut;
//
//         if (!file || !file.path || !userId) {
//             return {
//                 statusCode: 400,
//                 body: { success: false, message: 'Image file and userId are required' }
//             };
//         }
//
//         const imagePath = file.path;
//         const pythonScriptPath = path.join(__dirname, '../../python/match_face.py');
//
//         try {
//             const pythonStart = Date.now();
//             console.log("MATCH_SERVICE: Spawning Python process...");
//
//             const pythonProcess = spawn('python', [pythonScriptPath, imagePath, userId]);
//             const spawnOverhead = Date.now() - pythonStart;
//             console.log(`MATCH_SERVICE: Python process spawned in ${spawnOverhead}ms`);
//
//             let output = '';
//             const errorOutput = [];
//
//             const stdoutStart = Date.now();
//             for await (const chunk of pythonProcess.stdout) {
//                 const text = chunk.toString();
//                 output += text;
//                 // Live logging of each stdout line
//                 text.trim().split('\n').forEach(line => {
//                     console.log("MATCH_SERVICE: Python STDOUT:", line.trim());
//                 });
//             }
//             const stdoutTime = Date.now() - stdoutStart;
//             console.log(`MATCH_SERVICE: STDOUT read in ${stdoutTime}ms`);
//
//             const stderrStart = Date.now();
//             for await (const chunk of pythonProcess.stderr) {
//                 const errText = chunk.toString();
//                 errorOutput.push(errText);
//                 errText.trim().split('\n').forEach(line => {
//                     console.error("MATCH_SERVICE: Python STDERR:", line.trim());
//                 });
//             }
//             const stderrTime = Date.now() - stderrStart;
//             console.log(`MATCH_SERVICE: STDERR read in ${stderrTime}ms`);
//
//             const waitExitStart = Date.now();
//             const exitCode = await new Promise(resolve => pythonProcess.on('close', resolve));
//             const waitExitTime = Date.now() - waitExitStart;
//             const pythonTotalBlock = Date.now() - pythonStart;
//
//             console.log(`MATCH_SERVICE: Python process exited with code ${exitCode}`);
//             console.log(`MATCH_SERVICE: Total Python interaction: ${pythonTotalBlock}ms`);
//
//             // Extract reported time from Python logs
//             const pythonReportedLine = output.split('\n').find(line =>
//                 line.includes("Total script execution time")
//             );
//             const reportedTimeMatch = pythonReportedLine?.match(/([\d.]+)s/);
//             const pythonReportedMs = reportedTimeMatch ? parseFloat(reportedTimeMatch[1]) * 1000 : null;
//
//             if (pythonReportedMs !== null) {
//                 const overhead = pythonTotalBlock - pythonReportedMs;
//                 console.log(`MATCH_SERVICE: Reported by Python: ${pythonReportedMs.toFixed(0)}ms`);
//                 console.log(`MATCH_SERVICE: Measured by Node: ${pythonTotalBlock}ms`);
//                 console.log(`MATCH_SERVICE: Overhead (Node.js waiting/streaming): ${overhead.toFixed(0)}ms`);
//             }
//
//             // Parse JSON response
//             const parseStart = Date.now();
//             const jsonLine = output.trim().split('\n').find(line => {
//                 try {
//                     JSON.parse(line);
//                     return true;
//                 } catch {
//                     return false;
//                 }
//             });
//
//             if (!jsonLine) {
//                 throw new Error('No valid JSON found in Python output');
//             }
//
//             const parsed = JSON.parse(jsonLine);
//             const parseTime = Date.now() - parseStart;
//             console.log(`MATCH_SERVICE: JSON parsing completed in ${parseTime}ms`);
//             console.log("MATCH_SERVICE: Parsed JSON:", parsed);
//
//             if (exitCode !== 0) {
//                 return {
//                     statusCode: 500,
//                     body: {
//                         success: false,
//                         message: parsed?.error || 'Face matching script failed',
//                         error: errorOutput.join('')
//                     }
//                 };
//             }
//
//             // Punch logic
//             if (parsed.matched) {
//                 const punchStart = Date.now();
//                 const now = new Date();
//                 const date = now.toISOString().split('T')[0];
//                 const time = now.toTimeString().split(' ')[0];
//
//                 let punchBody = { employeeID: userId, date };
//                 if (mode === 'punchIn') punchBody.punch_in_time = time;
//                 else punchBody.punch_out_time = time;
//
//                 const punchResult = await punchHandler({ body: punchBody });
//                 const punchTime = Date.now() - punchStart;
//                 console.log(`MATCH_SERVICE: Punch processed in ${punchTime}ms`);
//                 console.log("MATCH_SERVICE: Punch result:", punchResult);
//
//                 const serviceEndTime = Date.now();
//                 console.log(`MATCH_SERVICE: Total service completed in ${serviceEndTime - serviceStartTime}ms`);
//                 console.log('='.repeat(50));
//
//                 return {
//                     statusCode: 200,
//                     body: {
//                         matched: true,
//                         user_id: userId,
//                         message: punchResult.message
//                     }
//                 };
//             } else {
//                 const totalServiceTime = Date.now() - serviceStartTime;
//                 console.log(`MATCH_SERVICE: Face not matched. Total time: ${totalServiceTime}ms`);
//                 return {
//                     statusCode: 401,
//                     body: { matched: false, message: 'Face not matched' }
//                 };
//             }
//
//         } catch (error) {
//             const serviceEndTime = Date.now();
//             console.error(`MATCH_SERVICE: Internal error after ${serviceEndTime - serviceStartTime}ms`);
//             console.error("MATCH_SERVICE: Error details:", error.message);
//             return {
//                 statusCode: 500,
//                 body: { success: false, message: 'Internal Server Error' }
//             };
//         } finally {
//             const cleanupStart = Date.now();
//             fs.unlink(imagePath, (err) => {
//                 const cleanupEnd = Date.now();
//                 if (err) {
//                     console.error(`MATCH_SERVICE: Error deleting image in ${cleanupEnd - cleanupStart}ms:`, err.message);
//                 } else {
//                     console.log(`MATCH_SERVICE: Temp image deleted in ${cleanupEnd - cleanupStart}ms`);
//                 }
//             });
//         }
//     };
// };
//
// module.exports = faceMatchService;
//
