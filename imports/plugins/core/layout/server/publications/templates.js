import { Meteor } from "meteor/meteor";
import { Templates } from "/lib/collections";

Meteor.publish("Templates", () => {
  return Templates.find({});
});
