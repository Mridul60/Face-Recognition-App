const db = require('../../config/dbConfig');

const facialService = () => {
    return async function facialHandler(httpRequest) {
        const { userId } = httpRequest.pathParams;

        try {
            const [rows] = await db.execute(
                'SELECT facialDescriptor FROM facialData WHERE employeeID = ? LIMIT 1',
                [userId]
            );

            const exists = rows.length > 0 && rows[0].facialDescriptor !== null;

            return {
                status: true,
                statusCode: 200,
                message: 'Facial descriptor check complete.',
                data: { exists }
            };
        } catch (err) {
            console.error('Facial check error:', err);
            return {
                status: false,
                statusCode: 500,
                message: 'Error checking facial descriptor.'
            };
        }
    };
};

module.exports = facialService;
