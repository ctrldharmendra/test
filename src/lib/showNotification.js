// File: src/lib/showNotification.js

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}

export async function showBrowserNotification(title, options = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    // Only trigger notification when the app/tab is in the background or screen is locked
    if (document.hidden) {
      const notificationOptions = {
        body: options.body || "",
        icon: options.icon || "/default-avatar.png",
        badge: options.badge || "/default-avatar.png",
        vibrate: [200, 100, 200],
        tag: options.tag,
        data: { url: options.url || "/chats" },
      };

      // 1. Try Mobile Service Worker method first (Android Chrome / Brave)
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(title, notificationOptions);
            return;
          }
        } catch (err) {
          console.warn("ServiceWorker notification failed, trying fallback...", err);
        }
      }

      // 2. Desktop Fallback (new Notification)
      try {
        const notification = new Notification(title, notificationOptions);
        notification.onclick = () => {
          window.focus();
          if (options.url) {
            window.location.href = options.url;
          }
          notification.close();
        };
      } catch (err) {
        console.warn("Desktop Notification construction failed:", err);
      }
    }
  }
}