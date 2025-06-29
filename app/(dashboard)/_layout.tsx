import { Stack } from 'expo-router';
import { StatusBar, Platform, View } from 'react-native';
import React from 'react';

export default function DashboardLayout() {
  const topPadding = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

  return (
    <>
      {/* Show translucent StatusBar */}
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Wrap your layout with manual top padding to avoid push-down */}
      <View style={{ flex: 1, paddingTop: topPadding }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </>
  );
}
