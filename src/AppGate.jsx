import React, { useEffect, useState } from "react";
import axios from "axios";
import SplashScreen from "./components/SplashScreen";
import Routes from "./Routes";

// Render's free tier can take a while to wake a sleeping backend, so this is
// generous — the splash simply waits for a real response (success or error)
// instead of racing a short timeout.
const HEALTH_CHECK_TIMEOUT_MS = 45000;

const AppGate = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get("health", { timeout: HEALTH_CHECK_TIMEOUT_MS })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return <SplashScreen />;
  return <Routes />;
};

export default AppGate;
