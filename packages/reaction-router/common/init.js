//
// init flow-router
//
/* eslint no-loop-func: 0 */

ReactionRouter = FlowRouter;

// client should wait on subs
if (Meteor.isClient) {
  ReactionRouter.wait();
}

// server can defer loading
if (Meteor.isServer) {
  ReactionRouter.setDeferScriptLoading(true);
}

// default not found route
ReactionRouter.notFound = {
  action() {
    ReactionLayout({
      template: "notFound"
    });
  }
};

/**
 * checkRouterPermissions
 * check if user has route permissions
 * @param  {Object} context - route context
 * @param  {redirect} null object
 * @return {Object} return context
 */
checkRouterPermissions = (context) => {
  const routeName = context.route.name;
  if (ReactionCore.hasPermission(routeName, Meteor.userId())) {
    if (context.unauthorized === true) {
      delete context.unauthorized;
      return context;
    }
    return context;
  }
  // determine if this is a valid route or a 404
  const routeExists = _.find(ReactionRouter._routes, function (route) {
    return route.path === context.path;
  });

  // if route exists (otherwise this will return 404)
  // return unauthorized flag on context
  if (routeExists) {
    context.unauthorized = true;
  }
  return context;
};
// initialize title and meta data and check permissions
ReactionRouter.triggers.enter([checkRouterPermissions, MetaData.init]);

/**
 * getRouteName
 * assemble route name to be standard
 * prefix/package name + registry name or route
 * @param  {String} packageName  [package name]
 * @param  {Object} registryItem [registry object]
 * @return {String}              [route name]
 */
const getRegistryRouteName = (packageName, registryItem) => {
  let routeName;
  if (packageName && registryItem) {
    if (registryItem.name) {
      routeName = registryItem.name;
    } else if (registryItem.template) {
      routeName = `${packageName}/${registryItem.template}`;
    } else {
      routeName = packageName;
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
ReactionRouter.initPackageRoutes = () => {
  const pkgs = ReactionCore.Collections.Packages.find().fetch();
  const prefix = ReactionCore.getShopName().toLowerCase(); // todo add shopId

  // initialize index
  // define default routing groups
  let shop = ReactionRouter.group({
    name: "shop"
  });

  //
  // index / home route
  // to overide layout, ie: home page templates
  // set DEFAULT_LAYOUT, in config.js
  //
  shop.route("/", {
    name: "index",
    action: function () {
      ReactionLayout(INDEX_OPTIONS);
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
            layout,
            workflow,
            triggersEnter,
            triggersExit
          } = registryItem;

          // get registry route name
          const routeName = getRegistryRouteName(pkg.name, registryItem);

          // layout option structure
          const options = {
            template: template,
            workflow: workflow,
            layout: layout
          };

          // define new route
          // we could allow the options to be passed in the registry if we need to be more flexible
          let newRouteConfig = {
            route: route,
            options: {
              name: routeName,
              template: options.template,
              layout: options.layout,
              triggersEnter: triggersEnter,
              triggersExit: triggersExit,
              action: () => {
                ReactionLayout(options);
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
    ReactionRouter.reload();
  }
};
