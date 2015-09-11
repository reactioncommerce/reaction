/**
 * cartPanel events
 *
 * goes to checkout on btn-checkout click
 *
 */
Template.cartPanel.events({
  'click #btn-checkout': function(event, template) {
    $('#cart-drawer-container').fadeOut();
    Session.set("displayCart", false);
    return Router.go("cartCheckout");
  }
});
