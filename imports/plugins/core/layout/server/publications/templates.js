import { Reaction } from "/server/api";
import { Meteor } from "meteor/meteor";
import { Templates } from "/lib/collections";

Meteor.publish("Templates", () => {
  const shopId = Reaction.getShopId();

  if (!shopId) {
    return this.ready();
  }

  return Templates.find({
    shopId
  });
});
