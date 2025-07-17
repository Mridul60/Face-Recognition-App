import React from "react";
import { Redirect } from "expo-router";
import Toast from 'react-native-toast-message';

export default function Index() {
  const isBeingDesigned = false;
  const isLoggedIn = false;

  if (isBeingDesigned) {
    return (
        <>
          <Redirect href="/register"/>
          <Toast />
        </>
    );
  }

  return (
      <>
        <Redirect href={isLoggedIn ? "/dashboard" : "/(auth)/login"} />
        <Toast />
      </>
  );
}
