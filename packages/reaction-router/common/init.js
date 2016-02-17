//
// init flow-router
//
/* eslint no-loop-func: 0 */

ReactionRouter = FlowRouter;
ReactionRouter.wait();

// default not found route
ReactionRouter.notFound = {
  action() {
    renderLayout({
      template: "notFound"
    });
  }
};

/**
 * getRouteName
 * assemble route name to be standard
 * prefix/package name + registry name or route
 * @param  {[type]} packageName  [package name]
 * @param  {[type]} registryItem [registry object]
 * @return {String}              [route name]
 */
ReactionRouter.getRouteName = (packageName, registryItem) => {
  let routeName;
  if (packageName && registryItem) {
    if (registryItem.name) {
      routeName = `${registryItem.name}`;
    } else if (registryItem.template) {
      routeName = `${packageName}/${registryItem.template}`;
    } else {
      routeName = `${packageName}`;
    }
    // dont include params in the name
    routeName = routeName.split(":")[0];
    return routeName;
  }
};

/**
 * initPackageRoutes
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @param {String} userId - userId
 * @returns {undefined} returns undefined
 */
ReactionRouter.initPackageRoutes = (userId) => {
  const pkgs = ReactionCore.Collections.Packages.find().fetch();
  const prefix = ReactionCore.getShopName().toLowerCase(); // todo add shopId

  // initialize index
  // define default routing groups
  let shop = ReactionRouter.group({
    name: "shop"
  });


  //
  // index / home route
  //
  shop.route("/", {
    name: "index",
    action: function () {
      renderLayout();
    }
  });

  // get package registry route configurations
  for (let pkg of pkgs) {
    const newRoutes = [];
    // pkg registry
    if (pkg.registry) {
      const registry = Array.from(pkg.registry);
      for (let registryItem of registry) {
        // registryItems
        if (registryItem.route) {
          let {
            route,
            template,
            workflow,
            triggersEnter,
            triggersExit
          } = registryItem;
          let options = {};
          let routeName;

          routeName = ReactionRouter.getRouteName(pkg.name, registryItem);
          // check route permissions
          if (ReactionCore.hasPermission(routeName, userId) || ReactionCore.hasPermission(route, userId)) {
            options.template = template;
            options.workflow = workflow;
          } else {
            // WIP - known issue with auth/login/reload
            options.template = "unauthorized";
            options.workflow = workflow;
          }

          // define new route
          // we could allow the options to be passed in the registry if we need to be more flexible
          let newRouteConfig = {
            route: route,
            options: {
              name: routeName,
              template: options.template,
              triggersEnter: triggersEnter,
              triggersExit: triggersExit,
              action: () => {
                renderLayout(options);
              }
            }
          };
          // push new routes
          newRoutes.push(newRouteConfig);
        } // end registryItems
      } // end package.registry

      //
      // add group and routes to routing table
      //
      let uniqRoutes = new Set(newRoutes);
      for (const route of uniqRoutes) {
        shop.newGroup = ReactionRouter.group({
          prefix: "/" + prefix
        });
        // todo: look for a cheap way to validate and prevent duplicate additions
        shop.newGroup.route(route.route, route.options);
      }
    }
  } // end package loop

  //
  // initialize the router
  //
  try {
    ReactionRouter.initialize();
  } catch (e) {
    // console.log ("Flow router already initialized.");
  }
};

Accounts.onLogin(function () {
  // this is likely to be a bad thing
  // testing in progress
  // the goal here is to reset routes on LOGIN
  // but need to make sure routes defined outside are kept
  // so we'll probably need to do this one route at a time.
  ReactionRouter._routes = [];
});
