import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";
import { connectorsRoles } from "../../lib/roles";

export const methods = {
  "synchooks/shopify/addHook": (hook) => {
    check(hook, { name: String, checked: Boolean });
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const [ topic, event, syncType ] = hook.name.split(":");
    const hookSetting = { topic, event, syncType };
    Packages.update({ name: "reaction-connectors-shopify", shopId: Reaction.getShopId() },
      { $push: { "settings.synchooks": hookSetting }
      });
  },
  "synchooks/shopify/removeHook": (hook) => {
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    check(hook, { name: String, checked: Boolean });
    const [ topic, event, syncType ] = hook.name.split(":");
    const hookSetting = { topic, event, syncType };
    Packages.update({ name: "reaction-connectors-shopify", shopId: Reaction.getShopId() },
      { $pull: { "settings.synchooks": hookSetting }
      });
  }
};

Meteor.methods(methods);
