import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
  const isBeingDesigned = false;
  if (isBeingDesigned) {
    return <Redirect href="/dashboard" />;
  }else {

    const isLoggedIn = false; // change to true to simulate a logged-in user

    return <Redirect href={isLoggedIn ? "/dashboard" : "/(auth)/login"} />;
  }
}
