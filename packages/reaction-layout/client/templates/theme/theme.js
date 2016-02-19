

Meteor.startup(() => {
  Tracker.autorun(() => {
    const subscription = Meteor.subscribe("Shops");

    if (subscription.ready()) {
      const shop = ReactionCore.Collections.Shops.findOne({});

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
