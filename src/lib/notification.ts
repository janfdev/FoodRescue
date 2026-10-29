"use client";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "denied";
  }
}

export function sendLocalNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
  }
) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const notificationOptions: NotificationOptions = {
    icon: options?.icon || "/icons/icon-192x192.png",
    badge: options?.badge || "/icons/icon-96x96.png",
    body: options?.body || "Pemberitahuan dari FoodRescue Rerasa",
    tag: options?.tag || "food-rescue-notif",
    ...options,
  };

  try {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, notificationOptions);
      });
    } else {
      new Notification(title, notificationOptions);
    }
  } catch (err) {
    console.warn("Gagal menampilkan notifikasi:", err);
  }
}
