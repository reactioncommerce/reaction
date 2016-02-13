//
// init flow-router
//
ReactionRouter = FlowRouter;

// default not found route
ReactionRouter.notFound = {
  action() {
    renderLayout({
      template: "notFound"
    });
  }
};

// pause router init until we
// call ReactionRouter.initialize()
// ReactionRouter.wait();

/**
 * initPackageRoutes
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @returns {undefined} returns undefined
 */

/* eslint no-loop-func: 0 */
ReactionRouter.initPackageRoutes = (userId) => {
  const pkgs = ReactionCore.Collections.Packages.find().fetch();
  // get package registry route configurations
  for (let pkg of pkgs) {
    const newRoutes = [];
    // pkg registry
    if (pkg.registry) {
      // console.log(pkg.registry);
      const registry = Array.from(pkg.registry);
      for (let registryItem of registry) {
        // registryItems
        if (registryItem.route && registryItem.template) {
          const segments = registryItem.route.split("/");
          let prefix = "/"; // todo add shopId
          let newRoute = registryItem.route;
          let isGroup = false;
          let routeName = pkg.name + "/" + registryItem.provides;
          /*
            since all routes must start with "/"
            there will be magic in Reaction Registry
            where we'll assume that the first
            route segment is a group definition
            example:
            "dashboard/test" = dashboard group, test route.
            "/dashboard/test" = "/dashboard/test" route.
          */
          if (newRoute.substr(0, 1) !== "/") {
            isGroup = true; //
            newRoute = `${newRoute.replace(segments[0], "")}`;
          }

          // check route permissions
          if (ReactionCore.hasPermission(routeName, userId) || ReactionCore.hasPermission(newRoute, userId)) {
            // define new route
            let newRouteConfig = {
              newRoute,
              provides: registryItem.provides,
              options: {
                name: routeName, // name: newRoute.replace("/", ""),
                template: registryItem.template,
                triggersEnter: registryItem.triggersEnter,
                triggersExit: registryItem.triggersExit,
                action: () => {
                  renderLayout({
                    template: registryItem.template
                  });
                }
              }
            };
            // check group segments
            if (segments.length > 1 && isGroup === true) {
              prefix += segments[0];
            }
            // push new routes
            newRoutes.push(newRouteConfig);
          } // end has permissions
        } // end registryItems
      } // end package.registry

      let uniqRoutes = new Set(newRoutes);
      for (let route of uniqRoutes) {
        let newGroup = ReactionRouter.group({
          prefix: "/" + route.provides,
          name: route.provides
        });
        // look for a cheap way to prevent duplicate additions
        newGroup.route(route.newRoute, route.options);
      }
    }
  } // end package loop
};

Meteor.startup(function () {
  if (Meteor.isClient) {
    Template.coreLayout.onCreated(function () {
      Tracker.autorun(function () {
        // initialize client routing
        if (ReactionCore.Subscriptions.Packages.ready() && ReactionCore.Subscriptions.Shops.ready()) {
          ReactionRouter.initPackageRoutes(Meteor.userId());
        }
      }); // end tracker
    });
  } else {
    // tbd: we could init server side routing here.
    // ReactionRouter.initPackageRoutes(Meteor.userId());
  }
});
