import config from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getPunchInAndOutTime = async (
    setPunchInTime: (time: string) => void,
    setPunchOutTime: (time: string) => void,
    setIsPunchedIn: (value: boolean) => void,
    setBothIsPunched: (value: boolean) => void
) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.warn("[getPunchInAndOutTime] No userId found in AsyncStorage.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        const apiURL = `${config.API.GET_ATTENDANCE}?employeeID=${userId}&date=${today}`;

        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const json = await response.json();
            const data = json.data;

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
            if (!data.punch_in_time && !data.punch_out_time) {
                setIsPunchedIn(false)
            }
            if (data.punch_in_time && !data.punch_out_time) {
                setIsPunchedIn(true)
            }
            if (data.punch_in_time && data.punch_out_time || !data.punch_in_time && data.punch_out_time) {
                setBothIsPunched(true)
            }


            await AsyncStorage.setItem('punchDate', today);
        } else {
            console.warn("[getPunchInAndOutTime] Failed to fetch data. Status:", response.status);
        }
    } catch (error) {
        console.error("[getPunchInAndOutTime] Error occurred:", error);
    }
};