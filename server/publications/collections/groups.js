import { Groups } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";

Meteor.publish("Groups", function (query = {}) {
  check(query, Object);
  const shopId = query.shopId || Reaction.getShopId();

  if (!shopId) {
    return this.ready();
  }
  const select = query || {};
  select.shopId = shopId;
  return Groups.find(select);
});
