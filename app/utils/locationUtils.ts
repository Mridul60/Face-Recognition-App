export const checkIfWithinOffice = (
    lat: number,
    lng: number,
    officeLocation: any,
    officeRadius: number,
    setIsWithinOffice: Function
) => {
    const R = 6371e3;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(officeLocation.latitude - lat);
    const dLon = toRad(officeLocation.longitude - lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) *
        Math.cos(toRad(officeLocation.latitude)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    setIsWithinOffice(distance <= officeRadius);
};
