Meteor.startup(function () {
  if (Meteor.isClient) {
    Tracker.autorun(function () {
      // initialize client routing
      if (ReactionCore.Subscriptions.Packages.ready() && ReactionCore.Subscriptions.Shops.ready()) {
        console.log("initialize core routes");
        ReactionRouter.initPackageRoutes(Meteor.userId());
      }
    }); // end tracker
  }
});
