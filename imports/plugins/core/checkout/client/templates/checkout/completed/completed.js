import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction, i18next } from "/client/api";
import { Orders } from "/lib/collections";
import { Template } from "meteor/templating";

/**
 * cartCompleted helpers
 *
 * if order status = new translate submitted message
 */
Template.cartCompleted.helpers({
  orderCompleted: function () {
    const id = Reaction.Router.getQueryParam("_id");
    if (id) {
      const ccoSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), id);
      if (ccoSub.ready()) {
        return true;
      }
    }
    return false;
  },
  order: function () {
    return Orders.findOne({
      userId: Meteor.userId(),
      cartId: Reaction.Router.getQueryParam("_id")
    });
  },
  orderStatus: function () {
    switch (this.workflow.status) {
      case "new":
        return i18next.t("cartCompleted.submitted");
      case "coreOrderWorkflow/processing":
        return i18next.t("cartCompleted.processing");
      case "coreOrderWorkflow/completed":
        return i18next.t("cartCompleted.completed");
      default:
        return this.workflow.status;
    }
  },
  userOrders: function () {
    if (Meteor.user()) {
      return Orders.find({
        userId: Meteor.userId(),
        cartId: this._id
      });
    }
    return {};
  }
});

/**
 * cartCompleted events
 *
 * adds email to order
 */
Template.cartCompleted.events({
  "click #update-order": function () {
    const templateInstance = Template.instance();
    const email = templateInstance.find("input[name=email]").value;
    check(email, String);
    const cartId = Reaction.Router.getQueryParam("_id");

    return Meteor.call("orders/addOrderEmail", cartId, email, (err) => {
      if (err) {
        Alerts.toast(i18next.t("mail.alerts.cantSendEmail"), "error");
      } else {
        const order = Orders.findOne({
          userId: Meteor.userId(),
          cartId: Reaction.Router.getQueryParam("_id")
        });
        Meteor.call("orders/sendNotification", order);
      }
    });
  }
});

/**
 * cartCompleted onCreated
 *
 * when the order is completed we need to destroy and recreate
 * the subscription to get the new cart
 */
Template.cartCompleted.onCreated(function () {
  const sessionId = Session.get("sessionId");
  const userId = Meteor.userId();
  const cartSub = Reaction.Subscriptions.Cart = Meteor.subscribe("Cart", sessionId, userId);
  cartSub.stop();
  Reaction.Subscriptions.Cart = Meteor.subscribe("Cart", sessionId, userId);
});
