"use client";

import { useEffect, useRef, useState } from "react";

interface SubscribeOptions {
  /** "booking" channel: pass bookingId + signedToken */
  bookingId?: string;
  bookingToken?: string;
  /** "crew" channel: no extra params needed, uses crew JWT from localStorage */
  type: "booking" | "crew";
}

type PermissionState = "default" | "granted" | "denied" | "unsupported";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return view;
}

function getInitialPermission(): PermissionState {
  if (process.env.NEXT_PUBLIC_PUSH_ENABLED !== "true") return "default";
  if (typeof window === "undefined") return "default";
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  return Notification.permission as PermissionState;
}

export function usePushNotification({ type, bookingId, bookingToken }: SubscribeOptions) {
  const [permission, setPermission] = useState<PermissionState>(getInitialPermission);
  const subscribedRef = useRef(false);

  useEffect(() => {
    console.log("[Push] effect, permission:", permission, "type:", type, "PUSH_ENABLED:", process.env.NEXT_PUBLIC_PUSH_ENABLED);
    if (process.env.NEXT_PUBLIC_PUSH_ENABLED !== "true") return;
    if (permission === "unsupported") return;
    if (permission === "granted") {
      // Guard: for booking type, don't auto-subscribe until required IDs are available
      const bookingReady = type !== "booking" || (!!bookingId && !!bookingToken);
      if (bookingReady) void subscribe();
    }
  // subscribe is defined in the same scope and stable for this mount lifecycle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, bookingId, bookingToken]);

  async function subscribe() {
    console.log("[Push] subscribe() called, VAPID:", !!VAPID_PUBLIC_KEY, "subscribed:", subscribedRef.current);
    if (!VAPID_PUBLIC_KEY) return;
    if (subscribedRef.current) return;

    try {
      const perm = await Notification.requestPermission();
      console.log("[Push] permission:", perm);
      setPermission(perm as PermissionState);
      if (perm !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      console.log("[Push] SW ready:", registration.scope);
      const existing = await registration.pushManager.getSubscription();
      console.log("[Push] existing subscription:", !!existing);
      const sub = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      if (type === "booking") {
        await fetch(`${API_URL}/v1/push/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint, keys, bookingId, token: bookingToken }),
        });
      } else {
        const crewToken = localStorage.getItem("crew-token") ?? "";
        await fetch(`${API_URL}/v1/crew/push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${crewToken}`,
          },
          body: JSON.stringify({ endpoint, keys }),
        });
      }

      subscribedRef.current = true;
      console.log("[Push] subscribed successfully");
    } catch (err) {
      console.error("[Push] subscribe error:", err);
    }
  }

  return { permission, subscribe };
}
