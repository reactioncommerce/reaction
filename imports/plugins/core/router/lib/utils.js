import Hooks from "./hooks";

/**
 * assemble route name to be standard prefix/package name + registry name or route
 * @param  {String} packageName  [package name]
 * @param  {Object} registryItem [registry object]
 * @returns {String}              [route name]
 * @private
 */
function getRegistryRouteName(packageName, registryItem) {
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
    [routeName] = routeName.split(":");
    return routeName;
  }
  return null;
}


/**
 * allows overriding of prefix in route definitions
 * @param  {Array} packageRoutes package routes
 * @returns {Array} updatedRoutes
 */
export function addRoutePrefixToPackageRoutes(packageRoutes) {
  // add group and routes to routing table
  const routes = [];
  for (const route of packageRoutes) {
    // allow overriding of prefix in route definitions
    // define an "absolute" url by excluding "/"
    route.group = {};

    if (route.route.substring(0, 1) !== "/") {
      route.route = `/${route.route}`;
      route.group.prefix = "";
    }

    routes.push(route);
  }
  return routes;
}

/**
 * get package registry route configurations
 * @param  {Function} ReactionLayout ReactionLayout
 * @param  {Array} packages package routes
 * @returns {Array} enabled package routes
 */
export function getEnabledPackageRoutes(ReactionLayout, packages) {
  const enabledPackageRoutes = []; // enabledPackageRoutes
  for (const pkg of packages) {
    // pkg registry
    if (pkg.registry && pkg.enabled) {
      const registry = Array.from(pkg.registry);
      for (const registryItem of registry) {
        // registryItems
        if (registryItem.route) {
          const {
            meta,
            route,
            permissions,
            template,
            layout,
            workflow
          } = registryItem;

          const name = getRegistryRouteName(pkg.name, registryItem);

          // define new route
          // we could allow the options to be passed in the registry if we need to be more flexible
          const reactionLayout = ReactionLayout({ template, workflow, layout, permissions });
          const newRouteConfig = {
            route,
            name,
            options: {
              meta,
              name,
              template,
              layout,
              triggersEnter: Hooks.get("onEnter", name),
              triggersExit: Hooks.get("onExit", name),
              component: reactionLayout.component,
              theme: reactionLayout.theme,
              structure: reactionLayout.structure
            }
          };
          // push shop route
          enabledPackageRoutes.push({
            ...newRouteConfig,
            route: `/shop/:shopSlug${route}`,
            options: {
              ...newRouteConfig.options,
              type: "shop-prefix"
            }
          });
          // push top-level route
          enabledPackageRoutes.push(newRouteConfig);
        } // end registryItems
      } // end package.registry
    }
  } // end package loop
  return enabledPackageRoutes;
}

