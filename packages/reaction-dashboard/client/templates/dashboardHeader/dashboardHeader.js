Template.dashboardHeader.events({
  'click #logout': function () {
    event.preventDefault();
    Meteor.logout(function (err) {
      if (err) {
        throwError(err.reason);
      } else {
        Router.go('/');
      }
    });
  }
});
