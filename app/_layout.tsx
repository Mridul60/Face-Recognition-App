import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import React, { useEffect } from 'react';


export default function DashboardLayout() {
  useEffect(() => {
    StatusBar.setHidden(true, 'slide');
    return () => StatusBar.setHidden(false); // show it back on unmount if needed
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

