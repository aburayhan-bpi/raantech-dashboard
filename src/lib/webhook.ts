/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Webhook Utility for External Automations (n8n, Zapier, etc.)
 */

/**
 * Fires a webhook asynchronously without blocking the main thread.
 *
 * @param url The webhook URL to send the payload to.
 * @param payload The data object to send as JSON.
 * @param source Optional string to identify where this webhook was fired from (for logging).
 */
export async function fireWebhook(
  url: string | undefined,
  payload: any,
  source: string = "Unknown",
) {
  if (!url) {
    // If no URL is provided, we silently ignore.
    // This allows the app to work normally even if webhooks are not configured.
    return;
  }

  try {
    // Using fetch to trigger the webhook
    // We intentionally don't await the response body to keep it fast
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      // Catching fetch network errors
      console.error(
        `[Webhook Error - ${source}]: Failed to reach webhook URL.`,
        err,
      );
    });
  } catch (error) {
    console.error(
      `[Webhook Error - ${source}]: Exception while firing webhook.`,
      error,
    );
  }
}

/**
 * Specifically sends a webhook when a new sale is created.
 *
 * @param saleData The populated sale document
 */
export function sendSaleCreatedWebhook(saleData: any) {
  const url = process.env.N8N_WEBHOOK_NEW_SALE;

  // Fire and forget - this will not block the API response
  fireWebhook(url, saleData, "New Sale");
}
