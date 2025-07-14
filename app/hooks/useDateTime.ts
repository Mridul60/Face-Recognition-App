import { useState, useEffect } from 'react';

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


    return { currentDate, currentTime };
}
