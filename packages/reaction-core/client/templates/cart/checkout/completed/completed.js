/**
 * cartCompleted helpers
 *
 * if order status = new translate submitted message
 */
Template.cartCompleted.onCreated = function () {
  Meteor.subscribe("Orders");
  // Meteor.subscribe("CompletedCartOrder", Meteor.userId(), Router.getParam("_id"));
};

Template.cartCompleted.helpers({
  orderStatus: function () {
    if (this.workflow.status === "new") {
      return i18n.t("cartCompleted.submitted");
    }
    return this.workflow.status;
  },
  userOrders: function () {
    if (Meteor.user()) {
      return ReactionCore.Collections.Orders.find({
        userId: Meteor.userId()
      });
    }
  }
});

/**
 * cartCompleted events
 *
 * adds email to order
 */
Template.cartCompleted.events({
  "click #update-order": function (event, template) {
    const email = template.find("input[name=email]").value;
    check(email, String);
    return Meteor.call("orders/addOrderEmail", Template.parentData()._id,
      email);
  }
});
