import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

Meteor.startup(() => {
  Tracker.autorun(() => {
    const subscription = Reaction.Subscriptions.Shops;
    if (subscription.ready()) {
      const shop = Shops.findOne({});

      if (shop) {
        if (shop.theme) {
          $("#reactionLayoutStyles").text(shop.theme.styles || "");
        } else {
          $("#reactionLayoutStyles").text("");
        }
      }
    }
  });
});
