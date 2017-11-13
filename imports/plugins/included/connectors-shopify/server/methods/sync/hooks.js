import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";

export const methods = {
  "synchooks/shopify/addHook": (hook) => {
    check(hook, { name: String, checked: Boolean });
    const [ topic, event, syncType ] = hook.name.split(":");
    const hookSetting = { topic, event, syncType };
    Packages.update({ name: "reaction-connectors-shopify", shopId: Reaction.getShopId() },
      { $push: { "settings.synchooks": hookSetting }
      });
  },
  "synchooks/shopify/removeHook": (hook) => {
    check(hook, { name: String, checked: Boolean });
    const [ topic, event, syncType ] = hook.name.split(":");
    const hookSetting = { topic, event, syncType };
    Packages.update({ name: "reaction-connectors-shopify", shopId: Reaction.getShopId() },
      { $pull: { "settings.synchooks": hookSetting }
      });
  }
};

Meteor.methods(methods);
