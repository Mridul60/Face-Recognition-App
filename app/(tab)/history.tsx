import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, RefreshControl, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {styles} from './styles';
import {getStatusIcon, getStatusColor} from "@/app/utils/attendanceUtils";
import DropdownSelector from "@/app/Components/history/DropdownSelector";
import {getAttendanceData} from "@/app/services/historyServices";
import AttendanceCard from "@/app/Components/history/AttendanceCard";

const AttendanceHistoryScreen = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(0); // Use index for years array
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    type AttendanceRecord = {
        id: number;
        date: string;
        day: string;
        inTime: string | null;
        outTime: string | null;
        isToday: boolean;
    };

    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    // const [totalAttendance, setTotalAttendance] = useState(0);

    // Create months array (simple strings)
    const months = Array.from({length: 12}, (_, i) =>
        new Intl.DateTimeFormat('en', {month: 'short'}).format(new Date(2000, i, 1))
    );

    // Create years array (simple strings)
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 3}, (_, i) => (currentYear - 2 + i).toString());

    // Set default year index to current year
    useEffect(() => {
        const currentYearIndex = years.findIndex(year => parseInt(year) === today.getFullYear());
        if (currentYearIndex !== -1) {
            setSelectedYear(currentYearIndex);
        }
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Convert selectedYear index to actual year value
            const actualYear = parseInt(years[selectedYear]);
            const data = await getAttendanceData(selectedMonth, actualYear);

            const today = new Date();
            const formatTime = (time: string | null): string | null => {
                if (!time) return null;
                const date = new Date(`1970-01-01T${time}`);
                return date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
            };

            const processed = data.map((item: any, index: number) => {
                const date = new Date(item.date);
                return {
                    id: index + 1,
                    date: date.toISOString(),
                    day: date.toLocaleDateString('en-US', {weekday: 'short'}),
                    inTime: formatTime(item.punch_in_time),
                    outTime: formatTime(item.punch_out_time),
                    isToday: date.toDateString() === today.toDateString(),
                };
            });


            setAttendanceData(processed);
        } catch (error) {
            console.error('Error loading attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    useEffect(() => {
        // Only load data if selectedYear is properly set
        if (selectedYear !== undefined && years[selectedYear]) {
            loadData();
        }
    }, [selectedMonth, selectedYear]);

    return (
        <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
            <View style={styles.content}>
                {/*<Text style={styles.totalAttendance}>Total attendance: {totalAttendance}</Text>*/}

                <View style={styles.dropdownRow}>
                    <DropdownSelector
                        data={months}
                        value={selectedMonth}
                        onChange={item => setSelectedMonth(item.value)}
                        placeholder="Month"
                        style={styles.dropdown}
                    />
                    <DropdownSelector
                        data={years}
                        value={selectedYear}
                        onChange={item => setSelectedYear(item.value)}
                        placeholder="Year"
                        style={styles.dropdown}
                    />
                </View>

                {/* Attendance List */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={{ color: '#666', marginTop: 10 }}>Loading...</Text>
                    </View>
                ) : (
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#007AFF']}
                                tintColor="#007AFF"
                            />
                        }
                    >
                        {attendanceData.map((record) => (
                            <View key={record.id} style={[styles.recordCard, record.isToday && styles.todayCard, {
                                flexDirection: 'row',
                                alignItems: 'center'
                            }]}>
                                {/* Left column - Circle with month and date */}
                                <View style={[styles.dateCircle, record.isToday && {backgroundColor: '#2196F3'}]}>
                                    <Text style={styles.dayNumberText}>
                                        {new Date(record.date).getDate()}
                                    </Text>
                                    <Text style={styles.monthText}>
                                        {new Date(record.date).toLocaleDateString('en-US', {month: 'short'})}
                                    </Text>
                                </View>

                                {/* Right column - Day, In, Out */}
                                <View style={{marginLeft: 16}}>
                                    <Text style={styles.dayText}>{record.day}</Text>
                                    <Text style={styles.timeText}>In-time: {record.inTime || '—:—'}</Text>
                                    <Text style={styles.timeText}>Out-time: {record.outTime || '—:—'}</Text>
                                </View>
                            </View>
                        ))}

                        {attendanceData.length === 0 && (
                            <View style={styles.emptyState}>
                                <Icon name="event-busy" size={48} color="#ccc"/>
                                <Text style={styles.emptyText}>No attendance records found</Text>
                                <Text style={styles.emptySubText}>
                                    for {months[selectedMonth]} {years[selectedYear]}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default AttendanceHistoryScreen;