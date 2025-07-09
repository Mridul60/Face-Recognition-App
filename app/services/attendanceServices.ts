import config from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const submitPunch = async (userId: string, date: string, time: string, type: 'in' | 'out') => {
    console.log("[submitPunch] Submitting punch data:", { userId, date, time, type });

    try {
        const response = await fetch(config.API.ATTENDANCE_PUNCH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeID: userId, date, time, type }),
        });

        const result = await response.json();
        console.log("[submitPunch] Server response:", result);
        return result;
    } catch (error) {
        console.error("[submitPunch] Error during punch submission:", error);
        throw error;
    }
};

export const getPunchInAndOutTime = async (
    setPunchInTime: (time: string) => void,
    setPunchOutTime: (time: string) => void
) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        console.log("[getPunchInAndOutTime] Retrieved userId from storage:", userId);

        if (!userId) {
            console.warn("[getPunchInAndOutTime] No userId found in AsyncStorage.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        console.log("[getPunchInAndOutTime] Today's date:", today);

        const apiURL = `${config.API.GET_ATTENDANCE}?employeeID=${userId}&date=${today}`;
        console.log("[getPunchInAndOutTime] Fetching attendance data from API:", apiURL);

        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const json = await response.json();
            const data = json.data;
            console.log("[getPunchInAndOutTime] Attendance API response:", data);

            if (data.punch_in_time) {
                console.log("[getPunchInAndOutTime] Setting punch-in time:", data.punch_in_time);
                setPunchInTime(data.punch_in_time);
                await AsyncStorage.setItem('punchInTime', data.punch_in_time);
            }

            if (data.punch_out_time) {
                console.log("[getPunchInAndOutTime] Setting punch-out time:", data.punch_out_time);
                setPunchOutTime(data.punch_out_time);
                await AsyncStorage.setItem('punchOutTime', data.punch_out_time);
            }

            await AsyncStorage.setItem('punchDate', today);
        } else {
            console.warn("[getPunchInAndOutTime] Failed to fetch data. Status:", response.status);
        }
    } catch (error) {
        console.error("[getPunchInAndOutTime] Error occurred:", error);
    }
};


// const storedPunchInTime = await AsyncStorage.getItem('punchInTime');
// const storedPunchOutTime = await AsyncStorage.getItem('punchOutTime');
// const storedDate = await AsyncStorage.getItem('punchDate');
//
// console.log("Stored punch data:", {
//     storedPunchInTime,
//     storedPunchOutTime,
//     storedDate,
// });
//
// if (storedDate === today) {
//     if (storedPunchInTime) {
//         console.log("Setting punch-in time from storage:", storedPunchInTime);
//         setPunchInTime(storedPunchInTime);
//     }
//     if (storedPunchOutTime) {
//         console.log("Setting punch-out time from storage:", storedPunchOutTime);
//         setPunchOutTime(storedPunchOutTime);
//     }
//     return;
// }
