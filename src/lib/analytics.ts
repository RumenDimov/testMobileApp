import PostHog, { type PostHogOptions } from 'posthog-react-native';
import Constants from 'expo-constants';

let client: PostHog | undefined;

const POSTHOG_API_KEY: string =
  (Constants.expoConfig?.extra?.posthogApiKey as string | undefined) ?? '';
const POSTHOG_HOST: string =
  (Constants.expoConfig?.extra?.posthogHost as string | undefined) ?? 'https://eu.i.posthog.com';

/** Initialise the PostHog client. Safe to call multiple times — no-op after first success. */
export function initAnalytics(): void {
  if (client) return;
  if (!POSTHOG_API_KEY) return;

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

/**
 * Emit a named event with optional properties.
 * @param eventName — snake_case event identifier
 * @param properties — optional flat key-value payload (string | number | boolean values only)
 */
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

/** Flush pending events. Call before app termination. */
export function shutdownAnalytics(): void {
  if (!client) return;

  try {
    client.flush();
  } catch {
    // Best-effort only
  }
}
