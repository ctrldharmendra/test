// File: src/lib/showNotification.js

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}

export function showBrowserNotification(title, options = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    // Only show notification if tab/page is currently hidden or not focused
    if (document.hidden) {
      const notification = new Notification(title, {
        icon: "/default-avatar.png",
        badge: "/default-avatar.png",
        vibrate: [200, 100, 200],
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notification.close();
      };
    }
  }
}