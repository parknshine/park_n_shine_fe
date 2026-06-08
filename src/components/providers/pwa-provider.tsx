"use client";


export function PwaProvider() {
  // PWA / service worker disabled — re-enable by uncommenting the block below
  // useEffect(() => {
  //   if (!("serviceWorker" in navigator)) {
  //     return;
  //   }
  //
  //   const registerServiceWorker = async () => {
  //     try {
  //       await navigator.serviceWorker.register("/sw.js", { scope: "/crew/" });
  //     } catch (error) {
  //       console.error("Service worker registration failed", error);
  //     }
  //   };
  //
  //   window.addEventListener("load", registerServiceWorker);
  //
  //   return () => {
  //     window.removeEventListener("load", registerServiceWorker);
  //   };
  // }, []);

  return null;
}
