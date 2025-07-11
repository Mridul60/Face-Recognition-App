import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
  const isBeingDesigned = false;
  if (isBeingDesigned) {
    return <Redirect href="/(dashboard)/face-verification" />;
  }else {

    const isLoggedIn = true; // change to true to simulate a logged-in user

    return <Redirect href={isLoggedIn ? "/dashboard" : "/(auth)/login"} />;
  }
}
