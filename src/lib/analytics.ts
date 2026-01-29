import { track } from '@vercel/analytics';

// Simple wrapper for Vercel Analytics Custom Events
export const trackEvent = (eventName: string, properties?: Record<string, string | number | boolean>) => {
    // Vercel Analytics automatically handles environment detection (dev/prod)
    track(eventName, properties);

    // Log in dev mode for visibility
    if (import.meta.env.DEV) {
        console.log(`[Analytics] Tracked: ${eventName}`, properties);
    }
};

// Vercel Analytics does not support identifying users by email (Privacy First)
// So we just log it or track it as a property if strictly necessary, but preferably we rely on the Backend/Slack for PII.
export const identifyUser = (email: string) => {
    // No-op for Vercel Analytics to respect privacy/GDPR compliance
    // We already capture the email in Supabase & Slack.
    if (import.meta.env.DEV) {
        console.log(`[Analytics] Identify (Mock): ${email}`);
    }

    // Optional: Track an event linking the session to a "Sign Up"
    track("lead_captured", { email_domain: email.split('@')[1] });
};
