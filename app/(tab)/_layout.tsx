import { router, Tabs } from 'expo-router';
import React from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native'; // native hook
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/logo.svg';
import PersonIcon from '@/assets/icons/person.svg';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const CustomHeaderWithLogo = () => {
    return (
      <View
        style={[
          styles.customHeader,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight ?? 10,
            backgroundColor: theme.tint,
            height: 120
          },
        ]}
      >
        <Logo width={142} height={79} />

        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={styles.avatarWrapper}
          hitSlop={10}
        >
          <View style={styles.avatarCircle}>
            <PersonIcon width={24} height={24} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
          android: {
            backgroundColor: theme.background,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          header: () => <CustomHeaderWithLogo />,
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={30} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerStyle: {
            backgroundColor: theme.tint,

          },
          headerTintColor: '#fff',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol name="history" color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 76,
  },
  avatarWrapper: {
    padding: 4,
  },
  avatarCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
