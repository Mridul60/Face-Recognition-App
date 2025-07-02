export const submitPunch = async (userId: string, date: string, time: string, type: 'in' | 'out') => {
    const response = await fetch('http://192.168.195.5:9000/attendance/punch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({employeeID: userId, date, time, type}),
    });
    return response.json();
};
