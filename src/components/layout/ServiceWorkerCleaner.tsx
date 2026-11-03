"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerCleaner
 * Ensures any lingering or stale Service Workers and CacheStorage entries
 * from previous builds are fully unregistered and evicted from the client's browser,
 * preventing stale shells from being served on live URLs.
 */
export function ServiceWorkerCleaner() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Unregister all existing service workers
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }

    // 2. Clear stale CacheStorage caches (e.g. modeldeck-shell-v1)
    if ("caches" in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  }, []);

  return null;
}

