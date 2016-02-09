//
// init flow-router
//
ReactionRouter = FlowRouter;
// ReactionRouter.wait();
ReactionRouter.initPackageRoutes = initPackageRoutes;
// default not found route
ReactionRouter.notFound = {
  action() {
    renderLayout({
      template: "notFound"
    });
  }
};

//
// force route rerender (todo: resolve the timing of init packages)
//
if (Meteor.isClient) {
  Tracker.autorun(function () {
    ReactionRouter.watchPathChange();
    ReactionRouter.initPackageRoutes();
  });
}
