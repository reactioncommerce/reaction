// *****************************************************
// returns "active" if we are on the current route
// we can use this in a class to mark current active nav
// *****************************************************
Template.introHeader.helpers({
  activeRouteClass: function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();
    var active = _.any(args, function (name) {
      return location.pathname === Router.path(name);
    });
    return active && 'active';
  }
});
