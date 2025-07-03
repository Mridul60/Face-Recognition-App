import AsyncStorage from "@react-native-async-storage/async-storage";

export const savePunchToHistory = async (
    punchType: 'in' | 'out',
    timestamp: string | number | Date
  ) => {
    try {
      const existingData = await AsyncStorage.getItem('attendanceHistory');
      let attendanceHistory = existingData ? JSON.parse(existingData) : [];
  
      const today = new Date(timestamp);
      const dateString = today.toLocaleDateString('en-GB'); // DD/MM/YYYY
      const timeString = today.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
  
      // Clear isToday flags
      attendanceHistory = attendanceHistory.map((r: any) => ({
        ...r,
        isToday: false,
      }));
  
      const todayIndex = attendanceHistory.findIndex(
        (record: { date: string }) => record.date === dateString
      );
  
      if (todayIndex >= 0) {
        if (punchType === 'in') {
          attendanceHistory[todayIndex].inTime = timeString;
          attendanceHistory[todayIndex].status = 'Present';
        } else {
          attendanceHistory[todayIndex].outTime = timeString;
          if (!attendanceHistory[todayIndex].inTime) {
            attendanceHistory[todayIndex].status = 'Late'; // Optional logic
          }
        }
        attendanceHistory[todayIndex].isToday = true;
      } else {
        const newEntry = {
          id: Date.now(),
          date: dateString,
          day: today.toLocaleDateString('en-US', { weekday: 'short' }),
          inTime: punchType === 'in' ? timeString : null,
          outTime: punchType === 'out' ? timeString : null,
          status: punchType === 'in' ? 'Present' : 'Late',
          isToday: true,
        };
        attendanceHistory.unshift(newEntry);
      }
  
      await AsyncStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory));
      return timeString;
    } catch (error) {
      console.error('Error saving punch to history:', error);
      throw error;
    }
  };
  