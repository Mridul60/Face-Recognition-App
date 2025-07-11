import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "@/config";

export const getAttendanceData = async (month: number, year: number) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.warn("[getAttendanceData] No userId found in AsyncStorage.");
            return [];
        }

        const apiURL = `${config.API.GET_ATTENDANCE_HISTORY}?employeeID=${userId}&month=${month}&year=${year}`;

        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("[getAttendanceData] API Error:", result.message || "Unknown error");
            return [];
        }

        return result.data || [];
    } catch (error) {
        console.error("[getAttendanceData] Fetch failed:", error);
        return [];
    }
};
