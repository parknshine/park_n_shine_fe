"use client";

import { useEffect } from "react";

export function PwaProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Unregister any previously installed service workers so old SW does not
    // intercept requests after deployment.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }, []);

  // PWA / service worker disabled — re-enable by replacing the block above with:
  // const registerServiceWorker = async () => {
  //   try {
  //     await navigator.serviceWorker.register("/sw.js", { scope: "/crew/" });
  //   } catch (error) {
  //     console.error("Service worker registration failed", error);
  //   }
  // };
  // window.addEventListener("load", registerServiceWorker);

  return null;
}
