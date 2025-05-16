import fetch from "node-fetch";
import crypto from "crypto";

const registeredWebhooks = [];

export function registerWebhook(eventType, url, apiKey) {
  registeredWebhooks.push({ eventType, url, apiKey });
}

export function triggerWebhooks(eventType, payload) {
  registeredWebhooks.filter(wh => wh.eventType === eventType).forEach(wh => {
    sendWebhookRequest(wh, payload);
  });
}

function sendWebhookRequest(webhook, payload) {
  fetch(webhook.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": webhook.apiKey,
      "x-signature": signPayload(payload),
    },
    body: JSON.stringify(payload),
  }).catch(err => console.error(`[WebhookManager] Error: ${err.message}`));
}

function signPayload(payload) {
  const secret = process.env.WEBHOOK_SECRET || "defaultSecret";
  return crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
}
