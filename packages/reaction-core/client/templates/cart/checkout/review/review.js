/**
* review status
* trigger checkoutPayment step on template render
*/

Template.checkoutReview.onRendered(function () {
  var currentStatus = ReactionCore.Collections.Cart.findOne().status
  if (currentStatus == "checkoutReview") {
    Meteor.call("cart/setStatus", "checkoutPayment");
  }

});
