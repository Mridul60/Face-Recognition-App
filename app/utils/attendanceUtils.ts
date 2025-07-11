import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Present': return '#4CAF50';
    case 'Late': return '#FF9800';
    case 'Absent': return '#F44336';
    case 'Holiday': return '#9C27B0';
    default: return '#757575';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Present': return 'check-circle';
    case 'Late': return 'access-time';
    case 'Absent': return 'cancel';
    case 'Holiday': return 'event';
    default: return 'help';
  }
};