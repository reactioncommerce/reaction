import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Orders, Packages } from "/lib/collections";
import { PaymentMethodArgument } from "/lib/collections/schemas";
import Reaction from "/server/api/core";

/**
 * @name orders/refund/create
 * @method
 * @memberof Orders/Methods
 * @summary Apply a refund to an already captured order
 * @param {String} orderId - order object
 * @param {Object} paymentMethod - paymentMethod object
 * @param {Number} amount - Amount of the refund, as a positive number
 * @param {Bool} sendEmail - Send email confirmation
 * @return {null} no return value
 */
export default function createRefund(orderId, paymentMethod, amount, sendEmail = true) {
  check(orderId, String);
  check(amount, Number);
  check(sendEmail, Match.Optional(Boolean));

  // Call both check and validate because by calling `clean`, the audit pkg
  // thinks that we haven't checked paymentMethod arg
  check(paymentMethod, Object);
  PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

  // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }
  const processor = paymentMethod.processor.toLowerCase();
  const order = Orders.findOne(orderId);
  const { transactionId } = paymentMethod;

  const packageId = paymentMethod.paymentPackageId;
  const settingsKey = paymentMethod.paymentSettingsKey;
  // check if payment provider supports de-authorize
  const checkSupportedMethods = Packages.findOne({
    _id: packageId
  }).settings[settingsKey].support;

  const orderMode = paymentMethod.mode;

  let result;
  let query = {};
  if (checkSupportedMethods.includes("De-authorize")) {
    result = Meteor.call(`${processor}/payment/deAuthorize`, paymentMethod, amount);
    query = {
      $push: {
        "billing.$.paymentMethod.transactions": result
      }
    };

    if (result.saved === false) {
      Logger.fatal(
        "Attempt for de-authorize transaction failed",
        order._id,
        paymentMethod.transactionId,
        result.error
      );
      throw new Meteor.Error("Attempt to de-authorize transaction failed", result.error);
    }
  } else if (orderMode === "capture") {
    result = Meteor.call(`${processor}/refund/create`, paymentMethod, amount);
    query = {
      $push: {
        "billing.$.paymentMethod.transactions": result
      }
    };

    if (result.saved === false) {
      Logger.fatal("Attempt for refund transaction failed", order._id, paymentMethod.transactionId, result.error);
      throw new Meteor.Error("Attempt to refund transaction failed", result.error);
    }
  }

  Orders.update(
    {
      "_id": orderId,
      "billing.shopId": Reaction.getShopId(),
      "billing.paymentMethod.transactionId": transactionId
    },
    {
      $set: {
        "billing.$.paymentMethod.status": "refunded"
      },
      ...query
    }
  );

  Hooks.Events.run("onOrderRefundCreated", orderId);

  // Send email to notify customer of a refund
  if (checkSupportedMethods.includes("De-authorize")) {
    Meteor.call("orders/sendNotification", order);
  } else if (orderMode === "capture" && sendEmail) {
    Meteor.call("orders/sendNotification", order, "refunded");
  }
}
