//face.match.service.js
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
            return {
                statusCode: 400,
                body: { success: false, message: 'Image file is required' }
            };
        }

        const imagePath = file.path;
        const pythonScriptPath = path.join(__dirname, '../../python/match_face.py');

        try {
            const pythonProcess = spawn('python', [pythonScriptPath, imagePath, userId]);

            let output = '';
            let errorOutput = '';

            console.log("face-match-service/before output chunk", new Date().toLocaleTimeString());
            // Capture stdout (JSON response)
            for await (const chunk of pythonProcess.stdout) {
                const text = chunk.toString();
                output += text;
            }
            console.log("face-match-service/after output chunk", new Date().toLocaleTimeString());

            // Capture stderr
            for await (const chunk of pythonProcess.stderr) {
                const errorText = chunk.toString();
                errorOutput += errorText;
            }

            // If there were timing logs, print them
            if (errorOutput) {
                console.log('\n=== Python Execution Timeline ===');
                console.log(errorOutput);
                console.log('=== End Python Timeline ===\n');
            }

            const exitCode = await new Promise(resolve => pythonProcess.on('close', resolve));

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
                console.error("JSON parsing error:", err.message);
                console.error("Raw Python output:", output);
                console.error("Python error output:", errorOutput);
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
                console.error("Python script failed with exit code:", exitCode);
                console.error("Error output:", errorOutput);
                return {
                    statusCode: 500,
                    body: {
                        success: false,
                        message: parsed?.error || 'Face matching script failed',
                        error: errorOutput
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
                const punchResult = await punchHandler(punchRequest);
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