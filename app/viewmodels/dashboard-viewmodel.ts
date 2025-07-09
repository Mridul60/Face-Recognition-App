import {router} from "expo-router";

export const handleMarkYourAttendance = (isPunchedIn: boolean) => {
    console.log("isPunchedIn", isPunchedIn);
    const punchInOrPunchOut = isPunchedIn ? 'punchOut' : 'punchIn';
    router.push({ pathname: '/face-verification', params: { punchInOrPunchOut } });
}