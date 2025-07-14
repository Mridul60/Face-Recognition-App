import {useState, useEffect} from 'react';

export function useDateTime() {
    const getCurrentDate = () =>
        new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const getCurrentTime = () =>
        new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
        });

    const [currentDate, setCurrentDate] = useState(getCurrentDate());
    const [currentTime, setCurrentTime] = useState(getCurrentTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(getCurrentDate());
            setCurrentTime(getCurrentTime());
        }, 1000); // update every second

        return () => clearInterval(interval);
    }, []);


    return {currentDate, currentTime};
}

export function to12HourFormat(timeStr: string): string {
    if (timeStr === '--:--') {
        return timeStr;
    } else {
        const [hourStr, minute] = timeStr.split(":");
        let hour = parseInt(hourStr, 10);
        let period = "AM";

        if (hour === 0) {
            hour = 12;
        } else if (hour === 12) {
            period = "PM";
        } else if (hour > 12) {
            hour -= 12;
            period = "PM";
        }

        const formattedHour = hour.toString().padStart(2, '0');

        return `${formattedHour}:${minute} ${period}`;
    }
}