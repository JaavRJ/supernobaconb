import React, { useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import HomePage from "../pages/HomePage";

export default function HomeRoute() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onAnimationEnd={() => setIsLoading(false)} />;
  }

  return <HomePage />;
}
