import Shopify from "shopify-api-node";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";

/**
 * @file Shopify connector webhook methods
 *       contains methods for creating and deleting webhooks providing
 *       synchronization between a Shopify store and a Reaction shop
 * @module connectors-shopify
 */

export const methods = {
  /**
   * Meteor method for creating a shopify webhook for the active shop
   * See: https://help.shopify.com/api/reference/webhook for list of valid topics
   * @async
   * @method connectors/shopify/webhooks/create
   * @param {object} options options object
   * @param {string} options.topic - the shopify topic to subscribe to
   * @param {string} [options.absoluteUrl] - Url to send webhook requests - should only be used in development mode
   * @return {undefined}
   */
  async "connectors/shopify/webhooks/create"(options) {
    check(options, Object);

    // Check for permissions
    if (!Reaction.hasPermission(["owner", "settings/connectors", "settings/connectors/shopify"])) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    // This code is duplicated in `../api/api`
    // But is left here intentionally as we are updating the specific shopifyPkg that this returns later in this method
    const shopifyPkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "reaction-connectors-shopify"
    });

    if (!shopifyPkg) {
      throw new Meteor.Error("server-error", `No shopify package found for shop ${Reaction.getShopId()}`);
    }

    const { settings } = shopifyPkg;
    const shopify = new Shopify({
      apiKey: settings.apiKey,
      password: settings.password,
      shopName: settings.shopName
    });

    const host = options.webhooksDomain || Meteor.absoluteUrl();
    const webhookAddress = `${host}webhooks/shopify/${options.topic.replace(/\//g, "-")}?shopId=${Reaction.getShopId()}`;
    try {
      // Create webhook on Shopify
      const webhookResponse = await shopify.webhook.create({
        topic: options.topic,
        address: webhookAddress,
        format: "json"
      });

      const webhook = {
        shopifyId: webhookResponse.id,
        topic: options.topic,
        address: webhookAddress,
        format: "json",
        integrations: options.integrations
        // TODO: Add method to update an existing webhook if we want to change the integrations that use it
        //       E.g. turn on inventory sync, but turn off order sync - both might use the same webhook subscription
      };

      // Add webhook to webhooks array in Shop specific connectors-shopify pkg
      Packages.update({ _id: shopifyPkg._id }, {
        $addToSet: {
          "settings.webhooks": webhook
        }
      });
    } catch (error) {
      Logger.error("server-error", `Shopify API Error creating new webhook: ${error.message}`, error);
      throw new Meteor.Error("server-error", `Shopify API Error creating new webhook: ${error.message}`);
    }
  },
  /**
   * Given a shopifyWebhookId, delete that webhook via the Shopify API
   * @async
   * @method connectors/shopify/webhooks/delete
   * @param {number} shopifyWebhookId The shopifyId of the webhook to delete
   * @returns {number} the number of Packages updated (either 1 or 0)
   */
  async "connectors/shopify/webhooks/delete"(shopifyWebhookId) {
    check(shopifyWebhookId, Number);

    // Check for permissions
    if (!Reaction.hasPermission(["owner", "settings/connectors", "settings/connectors/shopify"])) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    // This code is duplicated in `../api/api`
    // But is left here intentionally as we are updating the specific shopifyPkg that this returns later in this method
    const shopifyPkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "reaction-connectors-shopify"
    });

    if (!shopifyPkg) {
      throw new Meteor.Error("server-error", `No shopify package found for shop ${Reaction.getShopId()}`);
    }

    const { settings } = shopifyPkg;
    const shopify = new Shopify({
      apiKey: settings.apiKey,
      password: settings.password,
      shopName: settings.shopName
    });

    try {
      // delete webhook on Shopify
      await shopify.webhook.delete(shopifyWebhookId);

      // Remove webhook from webhooks array in Shop specific connectors-shopify pkg
      return Packages.update({ _id: shopifyPkg._id }, {
        $pull: {
          "settings.webhooks": { shopifyId: shopifyWebhookId }
        }
      });
    } catch (error) {
      // If Shopify returns a 404, it means this webhook doesn't exist
      if (error.statusCode === 404) {
        Logger.warn("api-error", "Shopify API Error, error deleting webhook, webhook not found.");

        // In this case, we need to delete the webhook from our database anyway
        return Packages.update({ _id: shopifyPkg._id }, {
          $pull: {
            "settings.webhooks": { shopifyId: shopifyWebhookId }
          }
        });
      }
      // If there is another error, throw it.
      throw new Meteor.Error("server-error", `Shopify API Error, error deleting webhook: ${error}`);
    }
  },
  /**
   * Delete all registered Shopify webhooks via the Shopify API
   * @async
   * @method connectors/shopify/webhooks/deleteAll
   * @returns {number} the number of Packages updated (either 1 or 0)
   */
  async "connectors/shopify/webhooks/deleteAll"() {
    // Check for permissions
    if (!Reaction.hasPermission(["owner", "settings/connectors", "settings/connectors/shopify"])) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    const shopifyPkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "reaction-connectors-shopify"
    });

    if (!shopifyPkg) {
      throw new Meteor.Error("server-error", `No shopify package found for shop ${Reaction.getShopId()}`);
    }

    const { settings } = shopifyPkg;
    const shopify = new Shopify({
      apiKey: settings.apiKey,
      password: settings.password,
      shopName: settings.shopName
    });

    const registeredShopifyWebhooks = settings.webhooks;

    // Exit early if no Shopify webhooks registered
    if (!Array.isArray(registeredShopifyWebhooks) || registeredShopifyWebhooks.length <= 0) {
      return Logger.debug("No Shopify webhooks registered. Exiting.");
    }

    const responses = [];
    // Start all asynchronous operations immediately.
    for (const webhook of registeredShopifyWebhooks) {
      responses.push(shopify.webhook.delete(webhook.shopifyId));
    }

    try {
      const results = await Promise.all(responses);
      Logger.debug("results", results);
    } catch (error) {
      if (error.statusCode === 404) {
        Logger.warn("api-warning", "At least one of the webhooks registered in Reaction was not found on Shopify");
      } else {
        // TODO: Implement retry queue with exponential back-off for requests which are rejected
        // because of too many requests
        // In that case, we may need to resolve promises one-by-one instead of using Promise.all
        Logger.error("api-error", "There was an error deleting webhooks on Shopify.", error);
      }
    }

    // Remove all registered webhooks
    return Packages.update({ _id: shopifyPkg._id }, {
      $set: {
        "settings.webhooks": []
      }
    });
  }
};

Meteor.methods(methods);
