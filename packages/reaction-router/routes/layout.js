/**
 * isCurrentLayout
 * @param {Object} layout - element of shops.layout array
 * @param {Object} setLayout - layout
 * @param {Object} setWorkflow - workflow
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
selectLayout = (layout, setLayout, setWorkflow) => {
  const currentLayout = setLayout || "coreLayout";
  const currentWorkflow = setWorkflow || "coreWorkflow";
  if (layout.layout === currentLayout && layout.workflow === currentWorkflow && layout.enabled === true) {
    return layout;
  }
};

/**
 * renderLayout
 * sets and returns reaction layout structure
 * @param {Object} context - this router context
 * @param {String} layout - string of shop.layout.layout (defaults to coreLayout)
 * @param {String} workflow - string of shop.layout.workflow (defaults to coreLayout)
 * @param {String} options - layout.structure overrides
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
renderLayout = (options = {}) => {
  const layout = options.layout || "coreLayout";
  const workflow = options.workflow || "coreWorkflow";

  Tracker.autorun(function () {
    if (ReactionCore.Subscriptions.Shops.ready()) {
      const shop = ReactionCore.Collections.Shops.findOne();
      const newLayout = shop.layout.find((x) => selectLayout(x, layout, workflow));
      // ensure package registry is loaded
      // ReactionRouter.initPackageRoutes();
      // oops this layout wasn't found. render notFound
      if (!newLayout) {
        ReactionCore.Log.warn("Failed to render layout", layout, workflow);
        BlazeLayout.render("notFound");
      } else {
        const layoutToRender = Object.assign({}, newLayout.structure, options);
        BlazeLayout.render(layout, layoutToRender);
      }
    }
  });
};

/**
 * initPackageRoutes
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @returns {undefined} returns undefined
 */

/* eslint no-loop-func: 0 */
initPackageRoutes = () => {
  const pkgs = ReactionCore.Collections.Packages.find().fetch();
  // get package registry route configurations
  for (let pkg of pkgs) {
    const newRoutes = [];
    // pkg registry
    if (pkg.registry) {
      for (let registryItem of pkg.registry) {
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
          // console.log(newRoute, ReactionCore.hasPermission(newRoute))
          // console.log(routeName, ReactionCore.hasPermission(routeName))
          if (ReactionCore.hasPermission(routeName) || ReactionCore.hasPermission(newRoute)) {
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
