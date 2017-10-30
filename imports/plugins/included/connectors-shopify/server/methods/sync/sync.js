import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction, Logger } from "/server/api";

/**
 * @file **Shopify Connector** - Methods for setting up and removing synchronization between a Shopify store and a Reaction shop
 * @module connectors-shopify
 */

export const methods = {
  /**
   * Given an array of integrations, creates and registers a webhook with the Shopify store for each integration
   * @method connectors/shopify/sync/setup
   * @param {array} integrations Array of integrations. Each integration should take the form
   *                                topic:method - e.g. orders/create:updateInventory
   *                                The top will be used to subscribe to a webhook and each integration will be stored
   *                                in the integrations array within the shopify webhooks settings
   *  @returns {undefined}
   */
  "connectors/shopify/sync/setup"(integrations) {
    check(integrations, [String]);

    // Check for permissions
    if (!Reaction.hasPermission(["owner", "settings/connectors", "settings/connectors/shopify"])) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    const integrationsByTopic = integrations.reduce((topics, integration) => {
      const splitIntegration = integration.split(":");
      const topic = splitIntegration[0];

      if (topics[topic]) {
        topics[topic].push(integration);
      } else {
        topics[topic] = [integration];
      }

      return topics;
    }, {});

    const topics = Object.keys(integrationsByTopic);
    topics.forEach((topic) => {
      Logger.info(`Setting up shopify webhook ${topic} for ${integrationsByTopic[topic]}`);
      Meteor.call("connectors/shopify/webhooks/create", {
        topic: topic,
        integrations: integrationsByTopic[topic]
      });
    });
  },
  /**
   * wrapper method for deleting all the shopify webhooks.
   * May be used in the future to do some checks before deleting
   * or to be a way to selectively delete webhooks.
   * @method connectors/shopify/sync/teardown
   * @returns {undefined}
   */
  "connectors/shopify/sync/teardown"() {
    // Check for permissions
    if (!Reaction.hasPermission(["owner", "settings/connectors", "settings/connectors/shopify"])) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    Meteor.call("connectors/shopify/webhooks/deleteAll");
  }
  // TODO: Add a "connectors/shopify/sync/update" method that can remove and add subscriptions based on integrations
  //       Once more than one sync integration is available for Shopify, we'll need a way to update webhooks,
  //       as well as selectively remove or add webhooks, or to add integrations to other webhooks
};

Meteor.methods(methods);
