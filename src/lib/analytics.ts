import PostHog, { type PostHogOptions } from 'posthog-react-native';

let client: PostHog | undefined;

const POSTHOG_API_KEY = 'phc_placeholder';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

export function initAnalytics(): void {
  if (client) return;

  try {
    const options: PostHogOptions = {
      host: POSTHOG_HOST,
      flushAt: 5,
      flushInterval: 30000,
      enableSessionReplay: false,
      captureAppLifecycleEvents: false,
    };

    client = new PostHog(POSTHOG_API_KEY, options);
  } catch {
    // PostHog unavailable — analytics is best-effort only
  }
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!client) return;

  try {
    client.capture(eventName, properties ?? {});
  } catch {
    // Analytics errors must never crash the app
  }
}

export function identifyUser(distinctId?: string): void {
  if (!client) return;

  try {
    if (distinctId) {
      client.identify(distinctId);
    }
  } catch {
    // Best-effort only
  }
}

export function shutdownAnalytics(): void {
  if (!client) return;

  try {
    client.flush();
  } catch {
    // Best-effort only
  }
}
