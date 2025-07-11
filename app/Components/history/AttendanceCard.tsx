// /components/AttendanceCard.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getStatusColor, getStatusIcon} from '../../utils/attendanceUtils';
import {styles} from '../../(tab)/styles';

type AttendanceRecord = {
    id: number;
    date: string;
    day: string;
    inTime: string | null;
    outTime: string | null;
    isToday: boolean;
};

const AttendanceCard = ({record}: {record: AttendanceRecord}) => (
    <View key={record.id} style={[styles.recordCard, record.isToday && styles.todayCard, {flexDirection: 'row', alignItems: 'center'}]}>
        {/* Left column - Circle with month and date */}
        <View style={styles.dateCircle}>
            <Text style={styles.monthText}>
                {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
            </Text>
            <Text style={styles.dayNumberText}>
                {new Date(record.date).getDate()}
            </Text>
        </View>

        {/* Right column - Day, In, Out */}
        <View style={{marginLeft: 16}}>
            <Text style={styles.dayText}>{record.day}</Text>
            <Text style={styles.timeText}>In: {record.inTime || '—'}</Text>
            <Text style={styles.timeText}>Out: {record.outTime || '—'}</Text>
        </View>
    </View>

);

export default AttendanceCard;
