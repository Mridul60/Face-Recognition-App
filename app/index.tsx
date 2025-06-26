import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  // You can add logic here to check if the user is logged in
  return <Redirect href="./(onboarding)" />;
}
