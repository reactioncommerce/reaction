import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";
import { matchPath } from "react-router";
import { Router as ReactRouter } from "react-router-dom";
import { Reaction } from "/client/api";
import pathToRegexp from "path-to-regexp";
import { isEqual } from "lodash";
import queryParse from "query-parse";
import { Session } from "meteor/session";
import { Tracker } from "meteor/tracker";
import App from "/imports/plugins/core/router/client/app";
import { Router } from "../lib";
import { MetaData } from "/lib/api/router/metadata";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";

const history = Router.history;

class BrowserRouter extends Component {
  static propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    store: PropTypes.object
  }

  static contextTypes = {
    store: PropTypes.object
  }

  componentWillMount() {
    this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
    this.handleLocationChange(history.location);
  }

  componentWillUnmount() {
    if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
  }

  handleLocationChange = location => {
    // Find all matching paths
    const foundPaths = Router.routes.filter((pathObject) => {
      return matchPath(location.pathname, {
        path: pathObject.route,
        exact: true
      });
    });

    // If no matching pathis, redirect to the not found page
    if (foundPaths.length === 0 && location.pathname !== "not-found") {
      Router.replace("not-found");
      return undefined;
    }

    // If we have a found path, take the first match
    const foundPath = foundPaths.length && foundPaths[0];
    const params = {};

    // Process the params from the found path definiton
    if (foundPath) {
      const keys = [];
      const re = pathToRegexp(foundPath.route, keys); // Create parser with route regex
      const values = re.exec(location.pathname); // Process values

      // Create params object
      keys.forEach((key, index) => {
        params[key.name] = values[index + 1];
      });
    }

    // Get serach (query) string from current location
    let search = location.search;

    // Remove the ? if it exists at the beginning
    if (typeof search === "string" && search.startsWith("?")) {
      search = search.substr(1);
    }

    // Create objext of all necessary data for the current route
    const routeData = {
      route: {
        ...foundPath,
        name: foundPath.name,
        path: location.pathname,
        fullPath: `${location.pathname}${location.search}`
      },
      params,
      query: queryParse.toObject(search), // Parse query string into object
      payload: location
    };

    // Get the previousroute, which is the currentRoute just before it changes
    const previousRoute = Router.current();

    // If it seems like we've moved to a differen route, then run the onExit
    // hooks for the previousRoute
    const routesAreSame = isEqual(previousRoute.route, routeData.route);
    const paramsAreSame = isEqual(previousRoute.params, routeData.params);
    const queryParamsAreSame = isEqual(previousRoute.query, routeData.query);

    const routesDiffer = routesAreSame && paramsAreSame && queryParamsAreSame;

    if (routesDiffer === false) {
      // Run on enter hooks
      Router.Hooks.run("onExit", "GLOBAL", routeData);
      Router.Hooks.run("onExit", previousRoute.name, previousRoute);

      // Set current route reactive-var
      Router.setCurrentRoute(routeData);

      // Run on enter hooks for the new route
      Router.Hooks.run("onEnter", "GLOBAL", routeData);
      Router.Hooks.run("onEnter", routeData.name, routeData);
    }
  }

  render() {
    return (
      <ReactRouter {...this.props} />
    );
  }
}

export function getRootNode() {
  let rootNode = document.getElementById("react-root");

  if (rootNode) {
    return rootNode;
  }
  const rootNodeHtml = "<div id='react-root'></div>";
  const body = document.getElementsByTagName("body")[0];

  body.insertAdjacentHTML("beforeend", rootNodeHtml);
  rootNode = document.getElementById("react-root");

  return rootNode;
}

export function initBrowserRouter() {
  Router.initPackageRoutes({
    reactionContext: Reaction,
    indexRoute: Session.get("INDEX_OPTIONS") || {}
  });

  Router.Hooks.onEnter(MetaData.init);

  Tracker.autorun(() => {
    if (Router.ready()) {
      ReactDOM.render((
        <BrowserRouter history={history}>
          <TranslationProvider>
            <App children={Router.reactComponents} />
          </TranslationProvider>
        </BrowserRouter>
      ), getRootNode());
    }
  });
}

export default BrowserRouter;
