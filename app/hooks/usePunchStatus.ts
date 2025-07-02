import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkPunchStatus = async (setIsPunchedIn: Function, setLastPunchTime: Function) => {
    const punchStatus = await AsyncStorage.getItem('punchStatus');
    const punchTime = await AsyncStorage.getItem('lastPunchTime');
    if (punchStatus) setIsPunchedIn(JSON.parse(punchStatus));
    if (punchTime) setLastPunchTime(punchTime);
};
