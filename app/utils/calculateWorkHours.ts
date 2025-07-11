export const calculateWorkHours = (inTime: string, outTime: string): string => {
    if (!inTime || !outTime || inTime === '--:--' || outTime === '--:--') return '--:--:--';

    const inDate = new Date(`2000-01-01T${inTime}`);
    const outDate = new Date(`2000-01-01T${outTime}`);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return '--:--:--';

    let diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

    const h = Math.floor(diffMs / (1000 * 60 * 60));
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
