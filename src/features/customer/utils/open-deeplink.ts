"use client";

/**
 * Attempts to open a deeplink URL and detects whether the app actually opened.
 *
 * On mobile browsers, a plain <a href="gojek://..."> or window.location.assign
 * can silently fail — the browser doesn't intercept the custom scheme and
 * either nothing happens or the user is bounced to the Play Store / App Store
 * even though the app is installed.
 *
 * Strategy:
 * 1. Record the current time.
 * 2. Navigate to the deeplink via a hidden iframe (more reliable than
 *    location.href for custom schemes on Android) + window.location fallback.
 * 3. Listen for visibilitychange — if the page becomes hidden, the app
 *    opened successfully.
 * 4. If the page is still visible after `timeoutMs`, call `onFallback()`.
 */

export interface DeeplinkResult {
  opened: boolean;
}

export function openDeeplink(
  url: string,
  onFallback: () => void,
  timeoutMs = 2500,
): void {
  let didFallback = false;

  function cleanup() {
    if (fallbackTimer) clearTimeout(fallbackTimer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", onPageHide);
  }

  function triggerFallback() {
    if (didFallback) return;
    didFallback = true;
    cleanup();
    onFallback();
  }

  function onVisibilityChange() {
    if (document.hidden) {
      // App opened — page went to background
      cleanup();
    }
  }

  function onPageHide() {
    // Safari sometimes fires pagehide instead of visibilitychange
    cleanup();
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);

  const fallbackTimer = setTimeout(triggerFallback, timeoutMs);

  // Try iframe approach first — works better on Android Chrome for custom schemes
  try {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    // Remove iframe after a short delay — if the app opened, this code
    // never runs (page is in background). If it didn't, clean up the iframe.
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  } catch {
    // Iframe failed — fall back to location.assign
    window.location.assign(url);
  }

  // Also try location.href as a secondary trigger (helps on iOS)
  // Use a small delay so the iframe has a chance first
  setTimeout(() => {
    if (!document.hidden) {
      window.location.href = url;
    }
  }, 150);
}
