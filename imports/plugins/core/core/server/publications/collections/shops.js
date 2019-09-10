import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";

// We should be able to publish just the enabled languages/currencies/
Meteor.publish("PrimaryShop", () => Shops.find({
  shopType: "primary"
}, {
  fields: {},
  limit: 1
}));
