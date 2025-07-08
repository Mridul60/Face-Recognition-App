import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View , Image, Text, StyleSheet} from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '@/app/(tab)/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '@/assets/icons/logo.svg';
import PersonIcon from '@/assets/icons/person.svg';




export default function TabLayout() {
  const colorScheme = useColorScheme();
  

  function CustomHeaderWithLogo() {
    const insets = useSafeAreaInsets();
    const colors = Colors['light']; // only light mode for now
  
    return (
      <View
        style={[
          styles.customHeader,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top : 10,
            backgroundColor: colors.tint,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}
      >
        <Logo width={142} height={79} /> 
        <View
          style={{
            width: 35,
            height: 35,
            borderRadius: 40,
            backgroundColor: "#fff", // or any bg
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PersonIcon width={24} height={24}  />
        </View>
      </View>
    );
  }
  


// In your TabLayout:

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
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
              backgroundColor: Colors[colorScheme ?? 'light'].tint, // custom green
            },
            headerTintColor: '#fff', // makes the title and back button white
            tabBarIcon: ({ color }: { color: string }) => (
              <IconSymbol name="history" color={color} size={30} />
            ),
          }}
        />
  
      </Tabs>

  );
}
