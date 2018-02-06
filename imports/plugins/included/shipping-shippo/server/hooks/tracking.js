import { Meteor } from "meteor/meteor";
import { MethodHooks } from "/server/api";

MethodHooks.before("shipping/status/refresh", (options) => {
  const orderId = options.arguments[0];
  Meteor.call("shippo/confirmShippingMethodForOrder", orderId);
});
