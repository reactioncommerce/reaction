import React from "react";
import { Route } from "react-router";
import createBrowserHistory from "history/createBrowserHistory";
import createMemoryHistory from "history/createMemoryHistory";
import pathToRegexp from "path-to-regexp";
import queryParse from "query-parse";
import Immutable from "immutable";
import { uniqBy } from "lodash";
import { Meteor } from "meteor/meteor";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { Tracker } from "meteor/tracker";
import { Packages, Shops } from "/lib/collections";
import { getComponent } from "@reactioncommerce/reaction-components/components";
import Hooks from "./hooks";

// Using a ternary operator here to avoid a mutable export - open to suggestions for a better way to do this
export const history = Meteor.isClient ? createBrowserHistory() : createMemoryHistory();

// Private vars
let currentRoute = Immutable.Map();
const routerReadyDependency = new Tracker.Dependency();
const routerChangeDependency = new Tracker.Dependency();

/** Class representing a static base router */
class Router {
  /**
   * history
   * @type {history}
   */
  static history = history

  /**
   * Hooks
   * @type {Hooks}
   */
  static Hooks = Hooks

  /**
   * Registered route definitions
   * @type {Array}
   */
  static routes = []

  /**
   * Router initialization state
   * @type {Boolean}
   */
  static _initialized = false;

  /**
   * Active classname for active routes
   * @type {String}
   */
  static activeClassName = "active";

  /**
   * Routes array
   * @type {Array}
   * @param {Array} value An array of objects
   */
  static set _routes(value) {
    Router.routes = value;
  }

  static get _routes() {
    return Router.routes;
  }

  /**
   * Triggers reactively on router ready state changed
   * @return {Boolean} Router initalization state
   */
  static ready() {
    routerReadyDependency.depend();
    return Router._initialized;
  }

  /**
   * Re-triggers router ready dependency
   * @return {undefined}
   */
  static triggerRouterReady() {
    routerReadyDependency.changed();
  }

  /**
   * Hooks
   * @type {Hooks}
   */
  static get triggers() {
    return Hooks;
  }

  /**
   * Get the current route date. Not reactive.
   * @return {Object} Object containing route data
   */
  static current() {
    return currentRoute.toJS();
  }

  /**
   * Set current route data. Is reactive.
   * @param {Object} routeData Object containing route data
   * @return {undefined}
   */
  static setCurrentRoute(routeData) {
    currentRoute = Immutable.Map(routeData);
    routerChangeDependency.changed();
  }

  /**
   * Get the name of the current route. Is reactive.
   * @return {String} Name of current route
   */
  static getRouteName() {
    const current = Router.current();

    return (current.route && current.route.name) || "";
  }

  /**
   * Get param by name. Is reactive.
   * @param  {String} name Param name
   * @return {String|undefined} String value or undefined
   */
  static getParam(name) {
    routerChangeDependency.depend();
    const current = Router.current();

    return (current.params && current.params[name]) || undefined;
  }

  /**
   * Get query param by name
   * @param  {String} name Query param name. Is reactive.
   * @return {String|undefined} String value or undefined
   */
  static getQueryParam(name) {
    routerChangeDependency.depend();
    const current = Router.current();

    return (current.query && current.query[name]) || undefined;
  }

  /**
   * Merge new query params with current params
   * @param {Object} newParams Object containing params
   * @return {undefined}
   */
  static setQueryParams(newParams) {
    const current = Router.current();

    // Merge current and new params
    const queryParams = Object.assign({}, current.query, newParams);

    // Any param marked as null or undefined will be removed
    for (const key in queryParams) {
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    }

    // Update route
    Router.go(current.route.name, current.params, queryParams);
  }

  /**
   * Watch path change. Is Reactive.
   * @return {undefined}
   */
  static watchPathChange() {
    routerChangeDependency.depend();
  }
}

/**
 * pathFor
 * @summary get current router path
 * @param {String} path - path to fetch
 * @param {Object} options - url params
 * @return {String} returns current router path
 */
Router.pathFor = (path, options = {}) => {
  const foundPath = Router.routes.find((pathObject) => {
    if (pathObject.route) {
      if (options.hash && options.hash.shopSlug) {
        if (pathObject.options.name === path && pathObject.route.includes("shopSlug")) {
          return true;
        }
      } else if (pathObject.options.name === path && !pathObject.route.includes("shopSlug")) {
        return true;
      }
    }

    // No path found
    return false;
  });

  if (foundPath) {
    // Pull the hash out of options
    //
    // This is becuase of Spacebars that we have hash.
    // Spacebars takes all params passed into a template tag and places
    // them into the options.hash object. This will also include any `query` params
    const hash = (options && options.hash) || {};

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

/**
 * Navigate to path with params and query
 * @param  {String} path Path string
 * @param  {Object} params Route params object
 * @param  {Object} query Query params object
 * @return {undefined} undefined
 */
Router.go = (path, params, query) => {
  let actualPath;

  const routerGo = () => {
    if (typeof path === "string" && path.startsWith("/")) {
      actualPath = path;
    } else {
      actualPath = Router.pathFor(path, {
        hash: {
          ...params,
          query
        }
      });
    }

    if (window) {
      history.push(actualPath);
    }
  };

  // if Router is in a non ready/initialized state yet, wait until it is
  if (!Router.ready()) {
    Tracker.autorun((routerReadyWaitFor) => {
      if (Router.ready()) {
        routerReadyWaitFor.stop();
        routerGo();
      }
    });

    return;
  }

  routerGo();
};

/**
 * Replace location
 * @param  {String} path Path string
 * @param  {Object} params Route params object
 * @param  {Object} query Query params object
 * @return {undefined} undefined
 */
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
 * Reload router
 * @return {undefined} undefined
 */
Router.reload = () => {
  const current = Router.current();

  if (window) {
    history.replace(current.route.fullPath || "/");
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
  const { group } = current.route;
  let prefix = "";

  if (current.route) {
    const { path } = current.route;

    if (group && group.prefix) {
      ({ prefix } = current.route.group);
    }

    // Match route
    if (prefix.length && routeName.startsWith(prefix) && path === routeName) {
      // Route name is a path and starts with the prefix. (default '/reaction')
      return Router.activeClassName;
    } else if (routeName.startsWith("/") && path === routeName) {
      // Route name isa  path and starts with slash, but was not prefixed
      return Router.activeClassName;
    } else if (current.route.name === routeName) {
      // Route name is the actual name of the route
      return Router.activeClassName;
    }
  }

  return "";
};

/**
 * hasRoutePermission
 * check if user has route permissions
 * @access private
 * @param  {Object} route - route context
 * @return {Boolean} returns `true` if user is allowed to see route, `false` otherwise
 */
function hasRoutePermission(route) {
  const routeName = route.name;

  return routeName === "index" ||
    routeName === "not-found" ||
    Router.Reaction.hasPermission(route.permissions, Meteor.userId());
}


/**
 * getRegistryRouteName
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
    [routeName] = routeName.split(":");
    return routeName;
  }
  return null;
}

/**
 * selectLayout
 * @access private
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
 * @access public
 * @param {Object} options - this router context
 * @param {String} options.layout - string of shop.layout.layout (defaults to coreLayout)
 * @param {String} options.workflow - string of shop.layout.workflow (defaults to coreLayout)
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
export function ReactionLayout(options = {}) {
  // Find a workflow layout to render

  // By default we'll use the primary shop for layouts
  let shopId = Router.Reaction.getPrimaryShopId();

  // We'll check the marketplace settings too so that we can use the active shopId
  // if merchantTemplates is enabled
  // XXX: using merchantTemplates is not ready for production and has not been tested! Use at your own risk.
  let marketplaceSettings;

  if (Meteor.isClient) { // If we're on the client, use the cached marketplace settings
    marketplaceSettings = Router.Reaction.marketplace;
  } else { // if we're on the server, go get the settings from the db with this method
    marketplaceSettings = Router.Reaction.getMarketplaceSettings();
    if (marketplaceSettings && marketplaceSettings.public) {
      // We're only interested in the public settings here
      marketplaceSettings = marketplaceSettings.public;
    }
  }

  // If merchantTemplates is enabled, use the active shopId
  if (marketplaceSettings && marketplaceSettings.merchantTemplates === true) {
    shopId = Router.Reaction.getShopId();
  }

  // Get the shop data
  const shop = Shops.findOne(shopId);

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

  let layoutTheme = "default";

  // Find a registered layout using the layoutName and workflowName
  if (shop) {
    const sortedLayout = shop.layout.sort((prev, next) => prev.priority - next.priority);
    const foundLayout = sortedLayout.find((x) => selectLayout(x, layoutName, workflowName));

    if (foundLayout) {
      if (foundLayout.structure) {
        layoutStructure = {
          ...foundLayout.structure
        };
      }
      if (foundLayout.theme) {
        layoutTheme = foundLayout.theme;
      }
    }
  }

  // If the original options did not include a workflow, but did have a template,
  // then we override the template from the layout with the one provided by the options.
  //
  // Why is this? We always need a workflow to render the entire layout of the app.
  // The default layout has a default template that may not be the one we want to render.
  // Some routes, such as `/account/profile` do no have a workflow, but define a template.
  // Without the logic below, it would end up rendering the homepage instead of the profile
  // page.
  // const optionsHasWorkflow = typeof options.workflow === "string";
  const optionsHasTemplate = typeof options.template === "string";

  if (optionsHasTemplate) {
    layoutStructure.template = options.template;
  }

  // If there is no Blaze Template (Template[]) or React Component (getComponent)
  // Then use the notFound template instead
  let hasReactComponent = true;

  try {
    getComponent(layoutStructure.template);
  } catch (e) {
    hasReactComponent = false;
  }

  if (!Template[layoutStructure.template] && !hasReactComponent) {
    return (
      <Blaze template={layoutStructure.notFound} />
    );
  }

  // Render the layout
  return {
    theme: layoutTheme,
    structure: layoutStructure,
    component: (props) => { // eslint-disable-line react/no-multi-comp, react/display-name
      const { route } = Router.current();
      const { permissions } = options;
      const structure = {
        ...layoutStructure
      };

      // If the current route is unauthorized, and is not the "not-found" route,
      // then override the template to use the default unauthorized template
      if (hasRoutePermission({ ...route, permissions }) === false && route.name !== "not-found" && !Meteor.user()) {
        if (!Router.Reaction.hasPermission(route.permissions, Meteor.userId())) {
          structure.template = "unauthorized";
        }
        return false;
      }
      try {
        // Try to create a React component if defined
        return React.createElement(getComponent(layoutName), {
          ...props,
          structure
        });
      } catch (e) {
        // eslint-disable-next-line
        console.warn(e, "Failed to create a React layout element");
      }
      // If all else fails, render a not found page
      return <Blaze template={structure.notFound} />;
    }
  };
}

/**
 * initPackageRoutes
 * registers route and template when registry item has
 * registryItem.route && registryItem.template
 * @param {Object} options - options and context for route creation
 * @returns {undefined} returns undefined
 */
Router.initPackageRoutes = (options) => {
  // make _initialized = false in case router is reinitialized
  Router._initialized = false;
  routerReadyDependency.changed();

  Router.Reaction = options.reactionContext;
  Router.routes = [];

  let marketplaceSettings = {
    shopPrefix: "/shop" // default value
  };

  const marketplace = Packages.findOne({
    name: "reaction-marketplace",
    shopId: Router.Reaction.getPrimaryShopId()
  });

  if (marketplace && marketplace.settings && marketplace.settings.public) {
    marketplaceSettings = marketplace.settings.public;
  }

  const pkgs = Packages.find().fetch();

  const routeDefinitions = [];

  // prefixing isnt necessary if we only have one shop
  // but we need to bypass the current
  // subscription to determine this.
  const shopSub = Meteor.subscribe("shopsCount");

  Tracker.autorun((shopSubWaitFor) => {
    if (shopSub.ready()) {
      shopSubWaitFor.stop();
      // using tmeasday:publish-counts

      // Default layouts
      const indexLayout = ReactionLayout(options.indexRoute);
      const notFoundLayout = ReactionLayout({ template: "notFound" });

      // Index route
      routeDefinitions.push({
        route: "/",
        name: "index",
        options: {
          name: "index",
          ...options.indexRoute,
          theme: indexLayout.theme,
          component: indexLayout.component,
          structure: indexLayout.structure
        }
      });

      routeDefinitions.push({
        route: `${marketplaceSettings.shopPrefix}/:shopSlug`,
        name: "index",
        options: {
          name: "index",
          type: "shop-prefix",
          ...options.indexRoute,
          theme: indexLayout.theme,
          component: indexLayout.component,
          structure: indexLayout.structure
        }
      });

      // Not-found route
      routeDefinitions.push({
        route: "/not-found",
        name: "not-found",
        options: {
          name: "not-found",
          ...notFoundLayout.indexRoute,
          theme: notFoundLayout.theme,
          component: notFoundLayout.component,
          structure: notFoundLayout.structure
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
                meta,
                route,
                permissions,
                template,
                layout,
                workflow
                // provides
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
                  triggersEnter: Router.Hooks.get("onEnter", name),
                  triggersExit: Router.Hooks.get("onExit", name),
                  component: reactionLayout.component,
                  theme: reactionLayout.theme,
                  structure: reactionLayout.structure
                }
              };
              newRoutes.push({
                ...newRouteConfig,
                route: `/shop/:shopSlug${route}`,
                options: {
                  ...newRouteConfig.options,
                  type: "shop-prefix"
                }
              });
              // push new routes
              newRoutes.push(newRouteConfig);
            } // end registryItems
          } // end package.registry

          //
          // add group and routes to routing table
          //
          for (const route of newRoutes) {
            // allow overriding of prefix in route definitions
            // define an "absolute" url by excluding "/"
            route.group = {};

            if (route.route.substring(0, 1) !== "/") {
              route.route = `/${route.route}`;
              route.group.prefix = "";
            }

            routeDefinitions.push(route);
          }
        }
      } // end package loop

      // Uniq-ify routes
      // Take all route definitions in the order that were received, and reverse it.
      // Routes defined later, like in the case of custom routes will then have a
      // higher precedence. Any duplicates after the first instance will be removed.
      //
      // TODO: In the future, sort by priority
      // TODO: Allow duplicated routes with a prefix / suffix / flag
      const uniqRoutes = uniqBy(routeDefinitions.reverse(), "route");
      const reactRouterRoutes = uniqRoutes.map((route, index) => (
        <Route
          key={`${route.name}-${index}`}
          path={route.route}
          exact={true}
          render={route.options.component}
        />
      ));

      // Last route, if no other route is matched, this one will be the not-found view
      // Note: This is last becuase all other routes must at-least attempt a match
      // before falling back to this not-found route.
      reactRouterRoutes.push((
        <Route
          key="not-found"
          render={notFoundLayout.component}
        />
      ));

      // Finish initialization
      Router._initialized = true;
      Router.reactComponents = reactRouterRoutes;
      Router._routes = uniqRoutes;

      // Trigger a reactive refresh to re-render routes
      routerReadyDependency.changed();
    }
  });
};


export default Router;
