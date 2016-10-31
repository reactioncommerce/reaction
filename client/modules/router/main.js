import _ from "lodash";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { FlowRouter as Router } from "meteor/kadira:flow-router-ssr";
import { BlazeLayout } from "meteor/kadira:blaze-layout";
import { Reaction, Logger } from "/client/api";
import { Packages, Shops } from "/lib/collections";
import { MetaData } from "/lib/api/router/metadata";
import Hooks from "./hooks";


// init flow-router
//
/* eslint no-loop-func: 0 */

// client should wait on subs
Router.wait();

Router.Hooks = Hooks;

/**
 * checkRouterPermissions
 * check if user has route permissions
 * @param  {Object} context - route context
 * @param  {redirect} null object
 * @return {Object} return context
 */
function checkRouterPermissions(context) {
  const routeName = context.route.name;

  if (Reaction.hasPermission(routeName, Meteor.userId())) {
    if (context.unauthorized === true) {
      delete context.unauthorized;
      return context;
    }
    return context;
  }
  // determine if this is a valid route or a 404
  const routeExists = _.find(Router._routes, function (route) {
    return route.path === context.path;
  });

  // if route exists (otherwise this will return 404)
  // return unauthorized flag on context
  if (routeExists) {
    context.unauthorized = true;
  }
  return context;
}


/**
 * getRouteName
 * assemble route name to be standard
 * prefix/package name + registry name or route
 * @param  {String} packageName  [package name]
 * @param  {Object} registryItem [registry object]
 * @return {String}              [route name]
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
    routeName = routeName.split(":")[0];
    return routeName;
  }
  return null;
}

/**
 * selectLayout
 * @param {Object} layout - element of shops.layout array
 * @param {Object} setLayout - layout
 * @param {Object} setWorkflow - workflow
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
function selectLayout(layout, setLayout, setWorkflow) {
  const currentLayout = setLayout || Session.get("DEFAULT_LAYOUT") || "coreLayout";
  const currentWorkflow = setWorkflow || Session.get("DEFAULT_WORKFLOW") || "coreWorkflow";
  if (layout.layout === currentLayout && layout.workflow === currentWorkflow && layout.enabled === true) {
    return layout;
  }
  return null;
}

/**
 * ReactionLayout
 * sets and returns reaction layout structure
 * @param {Object} options - this router context
 * @param {String} options.layout - string of shop.layout.layout (defaults to coreLayout)
 * @param {String} options.workflow - string of shop.layout.workflow (defaults to coreLayout)
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
export function ReactionLayout(options = {}) {
  const layout = options.layout || Session.get("DEFAULT_LAYOUT") || "coreLayout";
  const workflow = options.workflow || Session.get("DEFAULT_WORKFLOW") || "coreWorkflow";
  if (!options.layout) {
    options.layout = "coreLayout";
  }
  if (!options.workflow) {
    options.workflow = "coreWorkflow";
  }

  // check if router has denied permissions
  // see: checkRouterPermissions
  const unauthorized = {};
  if (Router.current().unauthorized) {
    unauthorized.template = "unauthorized";
  }

  // autorun router rendering
  Tracker.autorun(function () {
    if (Reaction.Subscriptions.Shops.ready()) {
      const shop = Shops.findOne(Reaction.getShopId());
      if (shop) {
        const newLayout = shop.layout.find((x) => selectLayout(x, layout, workflow));
        // oops this layout wasn't found. render notFound
        if (!newLayout) {
          BlazeLayout.render("notFound");
        } else {
          const layoutToRender = Object.assign({}, newLayout.structure, options, unauthorized);
          BlazeLayout.render(layout, layoutToRender);
        }
      }
    }
  });
  return options;
}

// default not found route
Router.notFound = {
  action() {
    ReactionLayout({
      template: "notFound"
    });
  }
};


/**
 * initPackageRoutes
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @param {String} userId - userId
 * @returns {undefined} returns undefined
 */
Router.initPackageRoutes = () => {
  const pkgs = Packages.find().fetch();
  const prefix = Reaction.getSlug(Reaction.getShopName()); // todo add shopId

  // prefixing isnt necessary if we only have one shop
  // but we need to bypass the current
  // subscription to determine this.
  const shopSub = Meteor.subscribe("shopsCount");
  if (shopSub.ready()) {
    // using tmeasday:publish-counts
    const shopCount = Counts.get("shops-count");

    // initialize index
    // define default routing groups
    const shop = Router.group({
      name: "shop"
    });

    //
    // index / home route
    // to overide layout, ie: home page templates
    // set INDEX_OPTIONS, in config.js
    //
    shop.route("/", {
      name: "index",
      action() {
        ReactionLayout(Session.get("INDEX_OPTIONS") || {});
      }
    });

    // get package registry route configurations
    for (const pkg of pkgs) {
      const newRoutes = [];
      // pkg registry
      if (pkg.registry && pkg.enabled) {
        const registry = Array.from(pkg.registry);
        for (const registryItem of registry) {
          // registryItems
          if (registryItem.route) {
            const {
              route,
              template,
              layout,
              workflow
            } = registryItem;

            // console.log(registryItem);

            // get registry route name
            const name = getRegistryRouteName(pkg.name, registryItem);

            // define new route
            // we could allow the options to be passed in the registry if we need to be more flexible
            const newRouteConfig = {
              route,
              options: {
                name,
                template,
                layout,
                triggersEnter: Router.Hooks.get("onEnter", name),
                triggersExit: Router.Hooks.get("onExit", name),
                action() {
                  ReactionLayout({ template, workflow, layout });
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
        const uniqRoutes = new Set(newRoutes);
        for (const route of uniqRoutes) {
          // allow overriding of prefix in route definitions
          // define an "absolute" url by excluding "/"
          if (route.route.substring(0, 1) !== "/") {
            route.route = "/" + route.route;
            shop.newGroup = Router.group({
              prefix: ""
            });
          } else if (shopCount <= 1) {
            shop.newGroup = Router.group({
              prefix: ""
            });
          } else {
            shop.newGroup = Router.group({
              prefix: "/" + prefix
            });
          }

          // todo: look for a cheap way to validate and prevent duplicate additions
          shop.newGroup.route(route.route, route.options);
        }
      }
    } // end package loop

    //
    // initialize the router
    //
    try {
      Router.initialize();
    } catch (e) {
      Logger.error(e);
    }
  }
};


/**
 * pathFor
 * @summary get current router path
 * @param {String} path - path to fetch
 * @param {Object} options - url params
 * @return {String} returns current router path
 */
Router.pathFor = (path, options = {}) => {
  const params = options.hash || {};
  const query = params.query ? Router._qs.parse(params.query) : {};
  // prevent undefined param error
  for (const i in params) {
    if (params[i] === null || params[i] === undefined) {
      params[i] = "/";
    }
  }
  return Router.path(path, params, query);
};

/**
 * isActive
 * @summary general helper to return "active" when on current path
 * @example {{active "name"}}
 * @param {String} routeName - route name as defined in registry
 * @return {String} return "active" or null
 */
Router.isActiveClassName = (routeName) => {
  Router.watchPathChange();
  const group = Router.current().route.group;
  let prefix;
  if (group && group.prefix) {
    prefix = Router.current().route.group.prefix;
  } else {
    prefix = "";
  }
  const path = Router.current().route.path;
  const routeDef = path.replace(prefix + "/", "");
  return routeDef === routeName ? "active" : "";
};

// Register Global Route Hooks
Meteor.startup(() => {
  Router.Hooks.onEnter(checkRouterPermissions);
  Router.Hooks.onEnter(MetaData.init);

  Router.triggers.enter(Router.Hooks.get("onEnter", "GLOBAL"));
  Router.triggers.exit(Router.Hooks.get("onExit", "GLOBAL"));
});


export default Router;
