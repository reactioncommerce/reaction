import { Reaction } from "/client/modules/core";
import { Shops } from "/lib/collections";

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
