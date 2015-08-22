
/**
* guestIsLoggedIn
* returns true if we've already past this stage,
* or if the user is a guest but not anonymous
*/


Template.checkoutLogin.helpers({
  guestIsLoggedIn: function () {
    guestUser = ReactionCore.hasPermission("guest", Meteor.user());
    anonUser = Roles.userIsInRole("anonymous", Meteor.user());
    currentStatus = ReactionCore.Collections.Cart.findOne().status
    if (currentStatus !== this.workflow && guestUser === true && anonUser === false) {
      return true;
    } else {
      return false;
    }
  }
});
