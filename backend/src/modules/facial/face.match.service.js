const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const PunchService = require('../attendance/punch.service');
const CustomError = require('../../util/error');
const punchHandler = PunchService({ CustomError, env: process.env});
const db = require('../../config/dbConfig');

const faceMatchService = () => {
    return async function faceMatchHandler(httpRequest) {
        // console.log("reached match service");
        const file = httpRequest?.file;
        const userId = httpRequest?.pathParams?.userId;
        const mode = httpRequest?.queryParams?.punchInOrPunchOut;
        console.log("mode: ", mode);
        if (!file || !file.path) {
            return {
                statusCode: 400,
                body: { success: false, message: 'Image file is required' }
            };
        }

        const imagePath = file.path;
        // console.log(`reached image path: ${imagePath}`);
        const pythonScriptPath = path.join(__dirname, '../../python/match_face.py');
        // console.log(`reached python script path: ${pythonScriptPath}`);
        try {
            const pythonProcess = spawn('python', [pythonScriptPath, imagePath, userId]);

            let output = '';
            const errorOutput = [];

            for await (const chunk of pythonProcess.stdout) {
                output += chunk.toString();
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
                        message: 'Face match failed',
                        error: errorOutput.join('')
                    }
                };
            }

            // Extract valid JSON from the output
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
            } catch (err) {
                return {
                    statusCode: 500,
                    body: {
                        success: false,
                        message: 'Invalid response from face matching script',
                        error: err.message,
                    }
                };
            }

            if (parsed.matched && parsed.user_id) {
                const employeeID = parsed.user_id;
                const now = new Date();
                const date = now.toISOString().split('T')[0]; // yyyy-mm-dd
                const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

                let punchBody = {
                    employeeID,
                    date
                }
                if (mode === 'punchIn') {
                    punchBody.punch_in_time = time;
                } else {
                    punchBody.punch_out_time = time;
                }

                const punchRequest = { body: punchBody };
                // console.log('Punch request: ', punchRequest);
                const punchResult = await punchHandler(punchRequest);
                return {
                    statusCode: 200,
                    body: {
                        matched: true,
                        user_id: employeeID,
                        punchStatus: punchResult.message
                    }
                };
            }


        } catch (error) {
            return {
                statusCode: 500,
                body: { success: false, message: 'Internal Server Error' }
            };
        } finally {
            fs.unlink(imagePath, () => {});
        }
    };
};

module.exports = faceMatchService;
