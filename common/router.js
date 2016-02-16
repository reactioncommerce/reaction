Meteor.startup(function () {
  if (Meteor.isClient) {
    Tracker.autorun(function () {
      // initialize client routing
      if (ReactionCore.Subscriptions.Packages.ready() && ReactionCore.Subscriptions.Shops.ready()) {
        ReactionRouter.initPackageRoutes(Meteor.userId());
      }
    }); // end tracker
  }
});
