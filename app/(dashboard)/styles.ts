import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    header: {
        backgroundColor: '#2F3E46',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {fontSize: 18, color: '#fff', fontWeight: '600'},
    headerRight: {flexDirection: 'row', alignItems: 'center', gap: 6},
    codeIcon: {color: '#fff', fontSize: 12, fontFamily: 'monospace', marginLeft: 4},

    mapContainer: {flex: 1},
    map: {flex: 1},
    loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

    officeCard: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    officeLabel: {fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1},
    officeName: {fontSize: 14, color: '#333', fontWeight: '600'},

    punchSection: {
        backgroundColor: '#F3F4F6',
        flex: 0.3,
        paddingVertical: 40,
        alignItems: 'center',
        gap: 8,
    },
    punchedIn: {
        backgroundColor: '#F4CE14',
    },
    fingerprintCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#354F52',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    fingerprintText: {fontSize: 14, color: '#374151', fontWeight: '600'},
    timestampText: {fontSize: 12, color: '#6B7280'},
    punchButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },

    screenSizeFooter: {
        backgroundColor: '#3B82F6',
        paddingVertical: 4,
        alignItems: 'center',
    },
    screenSizeText: {color: '#fff', fontSize: 12, fontFamily: 'monospace'},
    historyButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});

export default styles;