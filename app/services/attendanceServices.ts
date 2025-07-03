import config from "../../config"

export const submitPunch = async (userId: string, date: string, time: string, type: 'in' | 'out') => {
    const response = await fetch(config.API.ATTENDANCE_PUNCH, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({employeeID: userId, date, time, type}),
    });
    return response.json();
};
