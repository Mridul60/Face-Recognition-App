import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return <Stack />;
}

export const options = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 300,
}