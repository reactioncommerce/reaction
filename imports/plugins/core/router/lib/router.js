import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Tracker } from "meteor/tracker";
// import { FlowRouter as Router } from "meteor/kadira:flow-router-ssr";
import React, { Component, PropTypes } from "react"
import ReactDOM from "react-dom"
import { matchPath } from 'react-router'
import { Router as ReactRouter, Route } from "react-router-dom";
import createBrowserHistory from "history/createBrowserHistory";
import createMemoryHistory from "history/createMemoryHistory";
// import createHistory from 'history/createBrowserHistory'

import { BlazeLayout } from "meteor/kadira:blaze-layout";
// import { Reaction, Logger } from "/client/api";
import { Packages, Shops } from "/lib/collections";
import { MetaData } from "/lib/api/router/metadata";
import Hooks from "./hooks";
import { getComponent } from "/imports/plugins/core/layout/lib/components";

import Blaze from "meteor/gadicc:blaze-react-component";
import pathToRegexp from "path-to-regexp"
import queryParse from "query-parse";

// const Router = BrowserRouter

export let history;


const currentRoute = new ReactiveVar({});

if (Meteor.isClient) {
  history = createBrowserHistory();
} else {
  history = createMemoryHistory();
}

class Router {
  static history = history
  static Hooks = Hooks
  static routes = []


  static current() {
    return currentRoute.get();
  }

  static set currentRoute(data) {
    currentRoute.set(data);
  }

  static getRouteName() {
    const current = this.current();

    return current.options && current.options.name || "";
  }

  static getParam(name) {
    const current = Router.current();

    return current.params && current.params[name] || undefined;
  }

  static getQueryParam(name) {
    const current = Router.current();

    return current.query[name];
  }
}


Router._initialized = false;

// Hooks
// history.listen = (location, action) => {
//   const foundPath = Router.routes.find((pathObject) => {
//     return matchPath(location.pathname, {
//       path: pathObject.route
//     });
//   });
//
//   const params = {};
//
//   if (foundPath) {
//     const keys = [];
//     const re = pathToRegexp(foundPath.route, keys);
//     const values = re.exec(location.pathname);
//
//     keys.forEach((key, index) => {
//       params[key.name] = values[index + 1];
//     });
//   }
//
//   let search = location.search;
//
//   if (typeof search === "string" && search.startsWith("?")) {
//     search = search.substr(1);
//   }
//
//   Router.currentRoute = {
//     route: {
//       ...foundPath,
//       path: location.pathname
//     },
//     action,
//     params,
//     query: queryParse.toObject(search),
//     payload: location
//   };
//
//   // Router.Hooks.run("onEnter", "GLOBAL", Router.currentRoute.get());
// };


// init flow-router
//
/* eslint no-loop-func: 0 */

// client should wait on subs
// Router.wait();
//
// Router.history = history
// Router.Hooks = Hooks;
//
// Router.routes = [];

/**
 * pathFor
 * @summary get current router path
 * @param {String} path - path to fetch
 * @param {Object} options - url params
 * @return {String} returns current router path
 */
Router.pathFor = (path, options = {}) => {
  // const params = options.hash || {};
  // const query = params.query ? Router._qs.parse(params.query) : {};
  // // prevent undefined param error
  // for (const i in params) {
  //   if (params[i] === null || params[i] === undefined) {
  //     params[i] = "/";
  //   }
  // }
  // return Router.path(path, params, query);

  const foundPath = Router.routes.find((pathObject) => {
    // console.log(pathObject.options.name, path);
    if (pathObject.options.name === path) {
      return true;
    }
    return false;
  });

  if (foundPath) {
    // Pull the hash out of options
    //
    // This is becuase of Spacebars that we have hash.
    // Spacebars takes all params passed into a template tag and places
    // them into the options.hash object. This will also include any `query` params
    const hash = options && options.hash || {};

    // Create an executable function based on the route regex
    const toPath = pathToRegexp.compile(foundPath.route);

    // Compile the regex path with the params from the hash
    const compiledPath = toPath(hash);

    // Convert the query object to a string
    // e.g. { a: "one", b: "two"} => "a=one&b=two"
    const queryString = queryParse.toString(hash.query);

    // Return the compiled path + query string if we have one
    if (typeof queryString === "string" && queryString.length) {
      return `${compiledPath}?${queryString}`;
    }

    // Return only the compiled path
    return compiledPath;
  }

  return "/";
};


Router.go = (path, params, query) => {
  const actualPath = Router.pathFor(path, {
    hash: {
      ...params,
      query
    }
  });

  if (window) {
    history.push(actualPath);
  }
};

Router.replace = (path, params, query) => {
  const actualPath = Router.pathFor(path, {
    hash: {
      ...params,
      query
    }
  });

  if (window) {
    history.replace(actualPath);
  }
};

/**
 * isActive
 * @summary general helper to return "active" when on current path
 * @example {{active "name"}}
 * @param {String} routeName - route name as defined in registry
 * @return {String} return "active" or null
 */
Router.isActiveClassName = (routeName) => {
  const current = Router.current();
  const group = current.route.group;
  const path = current.route.path;
  let prefix;

  if (group && group.prefix) {
    prefix = current.route.group.prefix;
  } else {
    prefix = "";
  }

  if (typeof path === "string") {
    const routeDef = path.replace(prefix + "/", "");
    return routeDef === routeName ? "active" : "";
  }

  return "";
};

/**
 * checkRouterPermissions
 * check if user has route permissions
 * @param  {Object} context - route context
 * @param  {redirect} null object
 * @return {Object} return context
 */
function checkRouterPermissions(context) {
  const routeName = context.route.name;

  if (Router.Reaction.hasPermission(routeName, Meteor.userId())) {
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
 * hasRoutePermission
 * check if user has route permissions
 * @param  {Object} context - route context
 * @param  {redirect} null object
 * @return {Object} return context
 */
function hasRoutePermission(route) {
  const routeName = route.name;
  if (Router.Reaction.hasPermission(routeName, Meteor.userId())) {
    return true;
  }
  return false;
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
  // Find a workflow layout to render
  // Get the current shop data
  const shop = Shops.findOne(Router.Reaction.getShopId());

  // get the layout & workflow from options if they exist
  // Otherwise get them from the Session. this is set in `/client/config/defaults`
  // Otherwise, default to hard-coded values
  const layoutName = options.layout || Session.get("DEFAULT_LAYOUT") || "coreLayout";
  const workflowName = options.workflow || Session.get("DEFAULT_WORKFLOW") || "coreWorkflow";

  // Layout object used to render
  // Defaults provided for reference
  let layoutStructure = {
    template: "",
    layoutHeader: "",
    layoutFooter: "",
    notFound: "notFound",
    dashboardHeader: "",
    dashboardControls: "",
    dashboardHeaderControls: "",
    adminControlsFooter: ""
  };

  // Find a registered layout using the layoutName and workflowName
  if (shop) {
    const sortedLayout = shop.layout.sort((prev, next) => prev.priority - next.priority);
    const foundLayout = sortedLayout.find((x) => selectLayout(x, layoutName, workflowName));

    layoutStructure = {
      ...foundLayout.structure
    };
  }

  // If the original options did not include a workflow, but did have a template,
  // then we override the template from the layout with the one provided by the options.
  //
  // Why is this? We always need a workflow to render the entire layout of the app.
  // The default layout has a default template that may not be the one we want to render.
  // Some routes, such as `/account/profile` do no have a workflow, but define a template.
  // Without the logic below, it would end up rendering the homepage instead of the profile
  // page.
  const optionsHasWorkflow = typeof options.workflow === "string";
  const optionsHasTemplate = typeof options.template === "string";

  if (optionsHasTemplate) {
    layoutStructure.template = options.template;
  }

  // If the current route is unauthorized, then override the template to use
  // the default unauthroized template
  if (Router.current().unauthorized) {
    layoutStructure.template = "unauthorized";
  }

  // If there is no Blaze Template (Template[]) or React Component (getComponent)
  // Then use the notFound template instead
  if (!Template[layoutStructure.template] && !getComponent(layoutStructure.template)) {
    return (
      <Blaze template={layoutStructure.notFound} />
    );
  }

  // Render the layout
  return React.createElement(getComponent("AdminView"), layoutStructure);
}

// default not found route
// Router.notFound = {
//   action() {
//     ReactionLayout({
//       template: "notFound"
//     });
//   }
// };



const ReactBlazeWrapper = ({ template, workflow, layout }) => {
  const reactionLayout = ReactionLayout({ template, workflow, layout });
    // <Blaze template={reactionLayout} />

  return () => {
    return reactionLayout;
  };
};


/**
 * initPackageRoutes
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @param {String} userId - userId
 * @returns {undefined} returns undefined
 */
Router.initPackageRoutes = (options) => {
  Router.Reaction = options.reactionContext;

  const pkgs = Packages.find().fetch();
  const prefix = Router.Reaction.getShopPrefix();
  const finalRoutes = [];

  // prefixing isnt necessary if we only have one shop
  // but we need to bypass the current
  // subscription to determine this.
  const shopSub = Meteor.subscribe("shopsCount");
  if (shopSub.ready()) {
    // using tmeasday:publish-counts
    const shopCount = Counts.get("shops-count");

    // initialize index
    // define default routing groups
    // const shop = Router.group({
    //   name: "shop"
    // });

    //
    // index / home route
    // to overide layout, ie: home page templates
    // set INDEX_OPTIONS, in config.js
    //
    // shop.route("/", {
    //   name: "index",
    //   action() {
    //     ReactionLayout(Session.get("INDEX_OPTIONS") || {});
    //   }
    // });

    finalRoutes.push(
      <Route
        component={ReactBlazeWrapper(options.indexRoute)}
        exact={true}
        key="index"
        path="/"
      />
    );

    // Router.routes.push({
    //   route: "/",
    //   options: {
    //     name: "index"
    //   }
    // });

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
              meta,
              route,
              template,
              layout,
              workflow
            } = registryItem;

            // get registry route name
            const name = getRegistryRouteName(pkg.name, registryItem);

            // define new route
            // we could allow the options to be passed in the registry if we need to be more flexible
            const newRouteConfig = {
              route,
              name,
              options: {
                meta,
                name,
                template,
                layout,
                triggersEnter: Router.Hooks.get("onEnter", name),
                triggersExit: Router.Hooks.get("onExit", name),
                component: ReactBlazeWrapper({ template, workflow, layout }),
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
        let index = 0;
        for (const route of uniqRoutes) {
          // allow overriding of prefix in route definitions
          // define an "absolute" url by excluding "/"
          route.group = {};

          if (route.route.substring(0, 1) !== "/") {
            route.route = "/" + route.route;
            route.group.prefix = "";
          } else if (shopCount <= 1) {
            route.group.prefix = "";
          } else {
            route.group.prefix = prefix;
            route.route = `${prefix}${route.route}`;
          }

          // Check permissions before adding the route to the routing table
          if (hasRoutePermission(route)) {
            finalRoutes.push(
              <Route
                key={`${pkg.name}-${route.name}-${index++}`}
                path={route.route}
                component={route.options.component}
              />
            );
            Router.routes.push(route);
          }
        }
      }
    } // end package loop

    Router._initialized = true;

    return finalRoutes;
  }
};


export default Router;
