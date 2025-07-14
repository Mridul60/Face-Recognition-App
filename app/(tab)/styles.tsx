import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    // DASHBOARD STYLES
    customHeader: {
        height: 122,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    customHeaderLogo: {
        width: 60,
        height: 60,
        marginRight: 10,
    },
    customHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#84a98c',
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backButton: {
        marginRight: 15,
    },

    content: {
        flex: 1,
        padding: 16,
    },
    totalAttendance: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },

    dropdownRow: {
        flexDirection: 'row',
        gap: 10,
        // marginBottom: 16,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        borderColor: '#ccc',
        borderWidth: 1,
        flex: 1,
    },

    selectorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    selector: {
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        elevation: 1,
    },
    selectorText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },

    recordCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    todayCard: {
        borderLeftColor: '#2196F3',
        backgroundColor: '#f0f8ff',
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    // dayText: {
    //     fontSize: 14,
    //     color: '#666',
    //     marginBottom: 6,
    // },
    timeText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },

    checkOutButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    checkOutButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    dateCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
    },

    monthText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    dayNumberText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    dayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },

});
