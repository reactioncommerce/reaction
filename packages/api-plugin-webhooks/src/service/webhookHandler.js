import Logger from "@reactioncommerce/logger";

import fetch from "node-fetch";
import {
  generateSha256Hmac
} from "../util/util.js";
import {
  ReactionEventsEnumMapping,
  WEBHOOK_VALIDATION_HEADER
} from "./../util/enums.js";

import {
  getWebhooksByTopicAndShopId,
  incrementFailureCount,
  resetFailureCount
} from "./../repository/webhook.js";

import {
  enqueueRequest,
  processRequest
} from "./jobQueue.js";


export async function handleEvent(reactionEventType, eventData, context) {
  const webhookTopic = ReactionEventsEnumMapping[reactionEventType];

  if (!webhookTopic) {
    Logger.error("Invalid event type ", reactionEventType);
    return;
  }

  const shopId = getShopId(webhookTopic, eventData);

  if (!shopId) {
    Logger.error("No shopId in the event");
    return;
  }

  const webhooks = await getWebhooksByTopicAndShopId(webhookTopic, shopId, context);

  for (const webhook of webhooks) {
    enqueueRequest(await getJob(webhook, eventData, context));
  }

  await processRequest();
}

async function getJob(webhook, eventData, context) {
  const body = JSON.stringify({
    topic: webhook.topic,
    data: eventData
  });

  const request = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      [WEBHOOK_VALIDATION_HEADER]: await generateSha256Hmac(body)
    },
    method: "POST",
    body
  };

  return {
    async process() {
      const result = await fetch(webhook.address, request);

      if (!result || result.status >= 400) {
        throw Error(`HTTP Error Response: ${result?.status} - ${result?.statusText}`);
      }
    },
    async onSuccess(result) {
      await resetFailureCount(webhook._id, context);
    },
    async onError(error) {
      await incrementFailureCount(webhook._id, context);
    }
  };
}

function getShopId(webhookTopic, eventData) {
  let shopId;

  if (!eventData) {
    return null;
  }

  switch (webhookTopic) {
    case ReactionEventsEnumMapping.afterProductCreate:
    case ReactionEventsEnumMapping.afterProductUpdate:
    case ReactionEventsEnumMapping.afterProductSoftDelete:
      shopId = eventData.product.shopId;
      break;
    case ReactionEventsEnumMapping.afterVariantCreate:
    case ReactionEventsEnumMapping.afterVariantUpdate:
      shopId = eventData.productVariant.shopId;
      break;
    case ReactionEventsEnumMapping.afterVariantSoftDelete:
      shopId = eventData.variant.shopId;
      break;
    default:
      shopId = eventData.shopId;
      break;
  }

  return shopId;
}
