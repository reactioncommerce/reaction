import React from "react";
import { Route } from "react-router";
import createBrowserHistory from "history/createBrowserHistory";
import createMemoryHistory from "history/createMemoryHistory";
import pathToRegexp from "path-to-regexp";
import queryParse from "query-parse";
import Immutable from "immutable";
import { Meteor } from "meteor/meteor";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Tracker } from "meteor/tracker";
import { Packages, Shops } from "/lib/collections";
import { getComponent } from "/imports/plugins/core/layout/lib/components";
import BlazeLayout from "/imports/plugins/core/layout/lib/blazeLayout";
import Hooks from "./hooks";


export let history;

// Private vars
// const currentRoute = new ReactiveVar({});
let currentRoute = Immutable.Map();
const routerReadyDependency = new Tracker.Dependency;
const routerChangeDependency = new Tracker.Dependency;

// Create history object depending on if this is client or server
if (Meteor.isClient) {
  history = createBrowserHistory();
} else {
  history = createMemoryHistory();
}

// Base router class (static)
class Router {
  static history = history
  static Hooks = Hooks
  static routes = []
  static _routes = Router.routes // for legacy
  static _initialized = false;

  static ready() {
    routerReadyDependency.depend();
    return Router._initialized;
  }

  static triggerRouterReady() {
    routerReadyDependency.changed();
  }

  static get triggers() {
    return Hooks;
  }

  static current() {
    return currentRoute.toJS();
  }

  static setCurrentRoute(routeData) {
    currentRoute = Immutable.Map(routeData);
    routerChangeDependency.changed();
  }

  static getRouteName() {
    const current = Router.current();

    return current.options && current.options.name || "";
  }

  static getParam(name) {
    routerChangeDependency.depend();
    const current = Router.current();

    return current.params && current.params[name] || undefined;
  }

  static getQueryParam(name) {
    routerChangeDependency.depend();
    const current = Router.current();

    return current.query && current.query[name] || undefined;
  }

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
  let actualPath;

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
 * hasRoutePermission
 * check if user has route permissions
 * @param  {Object} route - route context
 * @return {Boolean} returns `true` if route is autoriized, `false` otherwise
 */
function hasRoutePermission(route) {
  const routeName = route.name;

  if (routeName === "index" || routeName === "not-found") {
    return true;
  } else if (Router.Reaction.hasPermission(routeName, Meteor.userId())) {
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

    if (foundLayout && foundLayout.structure) {
      layoutStructure = {
        ...foundLayout.structure
      };
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
  if (!Template[layoutStructure.template] && !getComponent(layoutStructure.template)) {
    return (
      <Blaze template={layoutStructure.notFound} />
    );
  }

  // Render the layout
  return {
    structure: layoutStructure,
    component: (props) => { // eslint-disable-line react/no-multi-comp, react/display-name
      const route = Router.current().route;
      const structure = {
        ...layoutStructure
      };

      // If the current route is unauthorized, and is not the "not-found" route,
      // then override the template to use the default unauthroized template
      if (hasRoutePermission(route) === false && route.name !== "not-found") {
        structure.template = "unauthorized";
      }

      if (getComponent(layoutName)) {
        return React.createElement(getComponent(layoutName), {
          ...props,
          structure: structure
        });
      } else if (Template[layoutName]) {
        return (
          <BlazeLayout
            {...structure}
            blazeTemplate={layoutName}
          />
        );
      }

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
  Router.Reaction = options.reactionContext;
  Router.routes = [];

  const pkgs = Packages.find().fetch();
  const prefix = Router.Reaction.getShopPrefix();
  const reactRouterRoutes = [];

  // prefixing isnt necessary if we only have one shop
  // but we need to bypass the current
  // subscription to determine this.
  const shopSub = Meteor.subscribe("shopsCount");
  if (shopSub.ready()) {
    // using tmeasday:publish-counts
    const shopCount = Counts.get("shops-count");

    // Index layout
    const indexLayout = ReactionLayout(options.indexRoute);
    const indexRoute = {
      route: "/",
      name: "index",
      options: {
        name: "index",
        ...options.indexRoute,
        component: indexLayout.component,
        structure: indexLayout.structure
      }
    };

    reactRouterRoutes.push(
      <Route
        exact={true}
        key="index"
        path="/"
        render={indexLayout.component}
      />
    );

    const notFoundLayout = ReactionLayout({ template: "notFound" });
    const notFoundRoute = {
      route: "/not-found",
      name: "not-found",
      options: {
        name: "not-found",
        ...notFoundLayout.indexRoute,
        component: notFoundLayout.component,
        structure: notFoundLayout.structure
      }
    };

    reactRouterRoutes.push(
      <Route
        key="not-found"
        path="/not-found"
        render={notFoundLayout.component}
      />
    );

    Router.routes.push(indexRoute);
    Router.routes.push(notFoundRoute);

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
            const reactionLayout = ReactionLayout({ template, workflow, layout });
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
                structure: reactionLayout.structure
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

          // Add the route to the routing table
          reactRouterRoutes.push(
            <Route
              key={`${pkg.name}-${route.name}-${index++}`}
              path={route.route}
              exact={true}
              render={route.options.component}
            />
          );

          Router.routes.push(route);
        }
      }
    } // end package loop

    Router._initialized = true;
    Router.reactComponents = reactRouterRoutes;
    Router._routes = Router.routes;

    routerReadyDependency.changed();
  }
};


export default Router;
