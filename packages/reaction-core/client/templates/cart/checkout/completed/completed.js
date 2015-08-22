/**
 * cartCompleted helpers
 *
 * if order status = new translate submitted message
 */

Template.cartCompleted.helpers({
  orderStatus: function() {
    var status;
    status = (typeof this !== "undefined" && this !== null ? this.status : void 0) || "processing";
    if (status === "new") {
      status = i18n.t('cartCompleted.submitted');
    }
    return status;
  },
  userOrders: function() {
    if (Meteor.user()) {
      return ReactionCore.Collections.Orders.find({
        userId: Meteor.userId(),
        sessionId: Session.get("sessionId")
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
  'click #update-order': function(event, template) {
    var email;
    email = template.find("input[name=email]").value;
    check(email, String);
    return Meteor.call("addOrderEmail", Template.parentData()._id, email);
  }
});
