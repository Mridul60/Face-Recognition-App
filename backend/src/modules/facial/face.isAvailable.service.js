const db = require('../../config/dbConfig');

const FaceIsAvailableService = () => {
    return async function faceIsAvailableHandler(httpRequest) {
        const userId = httpRequest?.pathParams?.userId;
        console.log("userId: ", userId);

        if (!userId) {
            return {
                statusCode: 400,
                body: { success: false, message: 'Missing userId in request params' }
            };
        }

        try {
            const result = await db.query("SELECT id FROM face_data WHERE employeeID = ?", [userId]);
            const exists = result.length > 0;
            return {
                statusCode: 200,
                body: { exists }
            };
        } catch (error) {
            console.error('Error checking face data:', error);
            return {
                statusCode: 500,
                body: { success: false, message: "Internal Server Error", error: error.message }
            };
        }
    };
};

module.exports = FaceIsAvailableService;
