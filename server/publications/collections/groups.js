import { Groups } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";

Meteor.publish("Groups", function (query = {}) {
  const shopId = query.shopId || Reaction.getShopId();

  if (!shopId) {
    return this.ready();
  }
  const select = query || {};
  select.shopId = shopId;
  return Groups.find(select);
});
