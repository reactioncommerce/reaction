import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";
import { connectorsRoles } from "../../lib/roles";

export const methods = {
  /**
   * @summary define hooks handlers for adding event hooks
   * @param {String} hook - The name of the hook to add a handler for
   * @returns {Number} Results of Packages update
   */
  "synchooks/shopify/addHook": (hook) => {
    check(hook, { name: String, checked: Boolean });
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const [topic, event, syncType] = hook.name.split(":");
    const hookSetting = { topic, event, syncType };
    return Packages.update({
      "name": "reaction-connectors-shopify",
      "shopId": Reaction.getShopId(),
      // This $not $elemMatch block prevents us from creating duplicate synchooks as we won't find a package to update that
      // matches this shopId and existing synchook
      "settings.synchooks": {
        $not: {
          $elemMatch: {
            topic: "orders",
            event: "orders/create",
            syncType: "exportToShopify"
          }
        }
      }
    }, {
      $push: { "settings.synchooks": hookSetting }
    });
  },
  /**
   * @summary define hooks handlers for removing event hooks
   * @param {String} hook - The name of the hook to remove a handler for
   * @returns {Number} Results of Packages update
   */
  "synchooks/shopify/removeHook": (hook) => {
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    check(hook, { name: String, checked: Boolean });
    const [topic, event, syncType] = hook.name.split(":");
    const hookSetting = { topic, event, syncType };
    return Packages.update(
      { name: "reaction-connectors-shopify", shopId: Reaction.getShopId() },
      { $pull: { "settings.synchooks": hookSetting } }
    );
  }
};

Meteor.methods(methods);
