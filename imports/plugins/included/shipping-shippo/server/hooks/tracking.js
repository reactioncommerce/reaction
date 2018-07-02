import { Meteor } from "meteor/meteor";
import MethodHooks from "/imports/plugins/core/core/server/method-hooks";

MethodHooks.before("shipping/status/refresh", (options) => {
  const orderId = options.arguments[0];
  Meteor.call("shippo/confirmShippingMethodForOrder", orderId);
});
