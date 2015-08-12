Template.loginInline.events({
  'click .continue-guest': function () {
    Meteor.call("cart/setStatus", 'checkoutLogin')
  }
});
