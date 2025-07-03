const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const PunchService = require('../attendance/punch.service');
const CustomError = require('../../util/error');
const punchHandler = PunchService({ CustomError, env: process.env});
const db = require('../../config/dbConfig');

const faceMatchService = () => {
    return async function faceMatchHandler(httpRequest) {
        const file = httpRequest?.file;

        if (!file || !file.path) {
            return {
                statusCode: 400,
                body: { success: false, message: 'Image file is required' }
            };
        }

        const imagePath = file.path;
        const pythonScriptPath = path.join(__dirname, '../../python/match_face.py');

        try {
            const pythonProcess = spawn('python', [pythonScriptPath, imagePath]);

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
                console.error('Failed to parse Python output:', output);
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

                // Check punch-in or punch-out
                const existing = await db.query(
                    'SELECT * FROM attendance WHERE employeeID = ? AND date = ?',
                    [employeeID, date]
                );

                const punchBody = {
                    employeeID,
                    date,
                    punch_in_time: existing.length === 0 ? time : null,
                    punch_out_time: existing.length > 0 && !existing[0].punch_out_time ? time : null
                };

                const punchRequest = { body: punchBody };
                const punchResult = await punchHandler(punchRequest);
                console.log("punchResult", punchResult);
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
            console.error('Face match error:', error);
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
