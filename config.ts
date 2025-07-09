const BASE_URL = 'http://10.176.44.5:9000'; // Change this only once

export default {
    BASE_URL,
    API: {
        ATTENDANCE_PUNCH: `${BASE_URL}/attendance/punch`,
        AUTH_LOGIN: `${BASE_URL}/auth/login`,
        GET_ATTENDANCE: `${BASE_URL}/attendance/get`,
        IS_AVAILABLE: (userId: string) => `${BASE_URL}/face/isAvailable/${userId}`,
        FACE_MATCH: (userId: string, punchInOrPunchOut: string | string[]) => `${BASE_URL}/face/match/${userId}?punchInOrPunchOut=${punchInOrPunchOut}`,
        FACE_REGISTER: (userId: string) => `${BASE_URL}/face/register/${userId}`,
        // CHECK_FACE: (userId: string) => `${BASE_URL}/face/isAvailable/${userId}`,
    }
};
