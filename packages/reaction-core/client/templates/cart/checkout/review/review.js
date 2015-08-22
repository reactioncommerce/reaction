/**
* review status
* trigger checkoutPayment step on template render
*/

Template.checkoutReview.onRendered(function () {
  Meteor.call("cart/setStatus", "checkoutPayment");
});
