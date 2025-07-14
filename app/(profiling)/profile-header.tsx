import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export const ProfileHeader = () => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: theme.tint,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '600', color: "#fff" }}>
        Profile
      </Text>

      <TouchableOpacity onPress={() => router.push('/history')}>
        <IconSymbol size={28} name="history" color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
