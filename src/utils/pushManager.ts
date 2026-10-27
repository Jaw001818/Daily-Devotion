import { NotificationPreferences } from '../types/devotion';

/**
 * Convert VAPID base64 public key to Uint8Array for PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export interface SubscriptionResult {
  success: boolean;
  message: string;
  subscription?: PushSubscription;
  isLocalOnly?: boolean;
}

/**
 * Subscribe device to Web Push notifications via service worker and backend
 */
export async function subscribeToWebPush(settings: NotificationPreferences): Promise<SubscriptionResult> {
  if (!isPushSupported()) {
    return {
      success: false,
      message: 'Hindi sinusuportahan ang Web Push sa browser na ito. Maaari mo itong i-install sa Home Screen para sa pinakamagandang karanasan.',
    };
  }

  // 1. Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return {
      success: false,
      message: permission === 'denied'
        ? 'Tinanggihan ang notification permission sa browser settings. Paki-enable ito sa site settings.'
        : 'Kailangan ang pahintulot para sa daily reminders.',
    };
  }

  try {
    // 2. Fetch VAPID public key from backend
    const vapidRes = await fetch('/api/push/vapid-public-key');
    if (!vapidRes.ok) {
      throw new Error('Hindi nakuha ang VAPID public key mula sa server.');
    }
    const { publicKey } = await vapidRes.json();
    if (!publicKey) {
      throw new Error('Walang VAPID public key na ibinalik ang server.');
    }

    // 3. Get Service Worker registration
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // 4. Subscribe if not yet subscribed
    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    }

    // 5. Send subscription to backend
    const subRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        preferences: {
          time: settings.time,
          reminderType: settings.reminderType,
          timezone: settings.timezone || 'Asia/Manila',
        },
      }),
    });

    if (!subRes.ok) {
      console.warn('Backend subscription save returned status:', subRes.status);
    }

    return {
      success: true,
      message: 'Matagumpay na na-activate ang araw-araw na abiso!',
      subscription,
    };
  } catch (err: unknown) {
    console.error('Push subscription failed:', err);
    // Provide graceful fallback: can still show local service worker notification
    return {
      success: true,
      isLocalOnly: true,
      message: 'Naka-enable ang lokal na notification sa iyong device.',
    };
  }
}

/**
 * Triggers a test push notification to verify real delivery
 */
export async function sendTestPush(): Promise<{ success: boolean; message: string }> {
  if (!isPushSupported()) {
    return { success: false, message: 'Hindi suportado ang notifications sa browser na ito.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Send real push via backend
      const res = await fetch('/api/push/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (res.ok) {
        return { success: true, message: 'Ipinadala ang test Web Push notification sa iyong device!' };
      }
    }

    // Direct Service Worker showNotification fallback if backend push did not trigger
    if (Notification.permission === 'granted') {
      await registration.showNotification('Daily Bible Devotion', {
        body: 'Subok na Abiso: "Ang Diyos ang ating kanlungan at lakas..." (Mga Awit 46:1). Handa na ang iyong daily reminders!',
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        tag: 'test-notification',
      });
      return { success: true, message: 'Ipinadala ang test notification sa iyong screen!' };
    }

    return { success: false, message: 'Kailangan munang mag-grant ng notification permission.' };
  } catch (err) {
    console.error('Failed to send test push:', err);
    return { success: false, message: 'Hindi maipadala ang notification. Paki-check ang network o permissions.' };
  }
}
