import React from 'react';
import { View, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Props {
    punchInTime: string;
    punchOutTime: string;
    totalWorkHours: string;
    styles: any;
}

const TimeSummary: React.FC<Props> = ({ punchInTime, punchOutTime, totalWorkHours, styles }) => (
    <View style={styles.timecontainer}>
        <View style={styles.topRow}>
            <View style={[styles.timebox, { borderRightWidth: 1 }]}>
                <View style={styles.row}>
                    <IconSymbol name="intime" size={16} color="#1c1c1c" />
                    <Text style={styles.label}> IN-TIME</Text>
                </View>
                <Text style={styles.timeText}>{punchInTime}</Text>
            </View>

            <View style={styles.timebox}>
                <View style={styles.row}>
                    <IconSymbol name="outtime" size={16} color="#1C1C1E" />
                    <Text style={styles.label}> OUT-TIME</Text>
                </View>
                <Text style={styles.timeText}>{punchOutTime}</Text>
            </View>
        </View>

        <View style={styles.totalBox}>
            <Text style={styles.label}>TOTAL WORK-HOUR</Text>
            <Text style={styles.timeText}>{totalWorkHours}</Text>
        </View>
    </View>
);

export default TimeSummary;
