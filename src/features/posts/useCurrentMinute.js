"use client";
import { useSyncExternalStore } from "react";
const snapshot = () => Math.floor(Date.now() / 60000) * 60000;
const serverSnapshot = () => 0;
function subscribe(callback) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}
export function useCurrentMinute() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
