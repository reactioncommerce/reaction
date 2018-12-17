import _ from "lodash";
import { check, Match } from "meteor/check";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders, Packages } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";
import sendOrderEmail from "../util/sendOrderEmail";

/**
 * @name orders/refunds/create
 * @method
 * @memberof Orders/Methods
 * @summary Apply a refund to an already captured order
 * @param {String} orderId - order object
 * @param {String} paymentId - ID of payment to refund
 * @param {Number} amount - Amount of the refund, as a positive number
 * @param {Bool} sendEmail - Send email confirmation
 * @return {null} no return value
 */
export default function createRefund(orderId, paymentId, amount, sendEmail = true) {
  check(orderId, String);
  check(paymentId, String);
  check(amount, Number);
  check(sendEmail, Match.Optional(Boolean));

  // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const order = Orders.findOne({ _id: orderId });
  const fulfillmentGroup = order.shipping.find((group) => group.payment._id === paymentId);
  const { _id: groupId, payment } = fulfillmentGroup;

  const { mode: paymentMode, paymentPluginName, name, transactionId } = payment;

  const paymentPlugin = Packages.findOne({ name: paymentPluginName, shopId: order.shopId });

  // check if payment provider supports de-authorize
  let result;
  let modifier = {};
  const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));
  if (_.get(paymentPlugin, "settings.support", []).indexOf("De-authorize") > -1) {
    result = Promise.await(getPaymentMethodConfigByName(name).functions.deAuthorizePayment(context, payment, amount));
    modifier = {
      $push: {
        "shipping.$.payment.transactions": result
      }
    };

    if (result.saved === false) {
      Logger.fatal(
        "Attempt for de-authorize transaction failed",
        order._id,
        transactionId,
        result.error
      );
      throw new ReactionError("Attempt to de-authorize transaction failed", result.error);
    }
  } else if (paymentMode === "capture") {
    result = Promise.await(getPaymentMethodConfigByName(name).functions.createRefund(context, payment, amount));
    modifier = {
      $push: {
        "shipping.$.payment.transactions": result
      }
    };

    if (result.saved === false) {
      Logger.fatal("Attempt for refund transaction failed", order._id, transactionId, result.error);
      throw new ReactionError("Attempt to refund transaction failed", result.error);
    }
  }

  const updateResult = Orders.update(
    {
      "_id": orderId,
      "shipping._id": groupId
    },
    {
      $set: {
        "shipping.$.payment.status": "refunded"
      },
      ...modifier
    }
  );

  if (updateResult !== 1) {
    throw new ReactionError("server-error", "Unable to update order");
  }

  const updatedOrder = Orders.findOne({ _id: orderId });
  Promise.await(appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: Reaction.getUserId()
  }));

  Hooks.Events.run("onOrderRefundCreated", orderId);

  // Send email to notify customer of a refund
  if (_.get(paymentPlugin, "settings.support", []).indexOf("De-authorize") > -1) {
    sendOrderEmail(order);
  } else if (paymentMode === "capture" && sendEmail) {
    sendOrderEmail(order, "refunded");
  }
}
