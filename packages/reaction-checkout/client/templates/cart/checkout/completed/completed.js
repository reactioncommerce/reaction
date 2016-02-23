/**
 * cartCompleted helpers
 *
 * if order status = new translate submitted message
 */
Template.cartCompleted.helpers({
  order: function () {
    const id =  ReactionRouter.getQueryParam("_id");
    if (id) {
      const ccoSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), id);
      if (ccoSub.ready()) {
        return ReactionCore.Collections.Orders.findOne({
          userId: Meteor.userId(),
          cartId: ReactionRouter.getQueryParam("_id")
        });
      }
    }
  },
  orderStatus: function () {
    if (this.workflow.status === "new") {
      return i18next.t("cartCompleted.submitted");
    }
    return this.workflow.status;
  },
  userOrders: function () {
    if (Meteor.user()) {
      return ReactionCore.Collections.Orders.find({
        userId: Meteor.userId(),
        cartId: this._id
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
    const cartId = ReactionRouter.getQueryParam("_id");
    return Meteor.call("orders/addOrderEmail", cartId, email);
  }
});
