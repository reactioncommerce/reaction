import Shopify from "shopify-api-node";

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";

// connectors-shopify/server/methods/sync.js
// contains methods for setting up and tearing down
// synchronization between a Shopify store and a Reaction shop

export const methods = {
  /**
   * Meteor method for creating a shopify webhook for the active shop
   * See: https://help.shopify.com/api/reference/webhook for list of valid topics
   * @async
   * @method connectors/shopify/createWebhook
   * @param {Object} options Options object
   * @param {string} options.topic - the shopify topic to subscribe to
   * @param {string} [options.absoluteUrl] - Url to send webhook requests
   * @return {void}
   */
  async "connectors/shopify/createWebhook"(options) {
    check(options, Object);

    // Check for permissions
    if (!Reaction.hasPermission(["owner", "settings/connectors", "settings/connectors/shopify"])) {
      throw new Meteor.error("access-denied", "Access denied");
    }

    const shopifyPkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "reaction-connectors-shopify"
    });

    if (!shopifyPkg) {
      throw new Meteor.Error("server-error", `No shopify package found for shop ${Reaction.getShopId()}`);
    }

    const settings = shopifyPkg.settings;
    const shopify = new Shopify({
      apiKey: settings.apiKey,
      password: settings.password,
      shopName: settings.shopName
    });

    const host = options.absoluteUrl || Meteor.absoluteUrl();
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
        format: "json"
      };

      // Add webhook to webhooks array in Shop specific connectors-shopify pkg
      Packages.update({ _id: shopifyPkg._id }, {
        $addToSet: {
          "settings.webhooks": webhook
        }
      });
    } catch (error) {
      throw new Meteor.Error("unknown-error", `Shopify API Error creating new webhook: ${error.message}`);
    }
  },
  /**
   * Given a shopifyWebhookId, attempts to delete that webhook via the Shopify API
   * @async
   * @method
   * @param {number} shopifyWebhookId The shopifyId of the webhook to delete
   * @returns {number} the number of Packages updated (either 1 or 0)
   */
  async "connectors/shopify/deleteWebhook"(shopifyWebhookId) {
    check(shopifyWebhookId, Number);

    // Check for permissions
    if (!Reaction.hasPermission(["owner", "settings/connectors", "settings/connectors/shopify"])) {
      throw new Meteor.error("access-denied", "Access denied");
    }

    const shopifyPkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "reaction-connectors-shopify"
    });

    if (!shopifyPkg) {
      throw new Meteor.Error("server-error", `No shopify package found for shop ${Reaction.getShopId()}`);
    }

    const settings = shopifyPkg.settings;
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
      throw new Meteor.Error("api-error", `Shopify API Error, error deleting webhook: ${error}`);
    }
  }
};

Meteor.methods(methods);
