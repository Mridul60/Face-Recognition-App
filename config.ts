// const BASE_URL = 'http://192.168.29.249:9000'; // Change this only once
// const BASE_URL = 'http://192.168.215.22:9000'; // Change this only once
// const BASE_URL = 'http://10.87.187.5:9000'; // Change this only once
const BASE_URL = 'http://192.168.195.129:9000'; // Change this only once

export default {
    BASE_URL,
    API: {

        PUNCH_ATTENDANCE: `${BASE_URL}/attendance/punch`,
        GET_ATTENDANCE: `${BASE_URL}/attendance/get`,
        GET_ATTENDANCE_HISTORY: `${BASE_URL}/attendance/getAttendanceHistory`,
        ISPUNCHEDIN: `${BASE_URL}/attendance/ispunchedin`,
        IS_AVAILABLE: (userId: string) => `${BASE_URL}/face/isAvailable/${userId}`,
        FACE_MATCH: (userId: string, punchInOrPunchOut: string | string[]) => `${BASE_URL}/face/match/${userId}?punchInOrPunchOut=${punchInOrPunchOut}`,
        FACE_REGISTER: (userId: string) => `${BASE_URL}/face/register/${userId}`,
        // CHECK_FACE: (userId: string) => `${BASE_URL}/face/isAvailable/${userId}`,
        AUTH_LOGIN: `${BASE_URL}/auth/login`,
        CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
        REGISTER_USER: `${BASE_URL}/auth/register`

    }
};
