import Logger from "@reactioncommerce/logger";

export async function getWebhooksByShopId(shopId, context) {
  const webhooksCollection = context.collections.Webhooks;

  const webhooksCursor = await webhooksCollection.find({
    shopId
  });

  const webhooks = [];

  if (!webhooksCursor || await webhooksCursor.count() === 0) {
    Logger.error("No webhooks found for shopId ", shopId);
    return webhooks;
  }

  await webhooksCursor.forEach((result) => {
    webhooks.push(result);
  });

  return webhooks;
}

export async function getWebhooksByTopicAndShopId(topic, shopId, context) {
  const webhooksCollection = context.collections.Webhooks;

  const webhooksCursor = await webhooksCollection.find({
    topic,
    shopId
  });

  const webhooks = [];

  if (!webhooksCursor || await webhooksCursor.count() === 0) {
    Logger.error("No webhooks found for topic ", topic);
    return webhooks;
  }

  await webhooksCursor.forEach((result) => {
    webhooks.push(result);
  });

  return webhooks;
}

export async function incrementFailureCount(id, context) {
  const webhooksCollection = context.collections.Webhooks;

  await webhooksCollection.updateOne({
    _id: id
  }, {
    $inc: {
      failureCounter: 1
    },
    $set: {
      updatedAt: new Date()
    }
  });
}

export async function resetFailureCount(id, context) {
  const webhooksCollection = context.collections.Webhooks;

  await webhooksCollection.updateOne({
    _id: id
  }, {
    $set: {
      failureCounter: 0,
      updatedAt: new Date()
    }
  });
}
