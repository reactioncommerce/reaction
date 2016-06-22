import { Meteor } from "meteor/meteor";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Shops } from "/lib/collections";

Meteor.publish("shopsCount", function () {
  Counts.publish(this, "shops-count", Shops.find());
});
