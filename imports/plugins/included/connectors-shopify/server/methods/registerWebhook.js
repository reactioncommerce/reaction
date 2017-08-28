import Shopify from "shopify-api-node";

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";

export const methods = {
  /**
   * Meteor method for creating a shopify webhook for the active shop
   * See: https://help.shopify.com/api/reference/webhook for list of valid topics
   * @async
   * @method connectors/shopify/createWebhook
   * @param {Object} options Options object
   * @param {string} options.topic - the shopify topic to subscribe to
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
      Logger.info("webhook", webhook);
    } catch (error) {
      throw new Meteor.Error("unknown-error", `Shopify API Error creating new webhook: ${error.message}`);
    }
  }
};

Meteor.methods(methods);
