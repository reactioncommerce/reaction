import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import { matchPath } from "react-router";
import { Router as ReactRouter } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import equal from "deep-equal";
import pathToRegexp from "path-to-regexp";
import queryParse from "query-parse";
import { Session } from "meteor/session";
import { Tracker } from "meteor/tracker";
import { ComponentsProvider } from "@reactioncommerce/components-context";
import { Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import initApollo from "/imports/plugins/core/graphql/lib/helpers/initApollo";
import { MetaData } from "/lib/api/router/metadata";
import { defaultTheme } from "@reactioncommerce/catalyst";
import { Router } from "../lib";
import appComponents from "./appComponents";
import theme from "./theme";

const { history } = Router;

class BrowserRouter extends Component {
  static propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    store: PropTypes.object
  }

  static contextTypes = {
    store: PropTypes.object
  }

  UNSAFE_componentWillMount() { // eslint-disable-line camelcase
    this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
    this.handleLocationChange(history.location);
  }

  componentWillUnmount() {
    if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
  }

  handleLocationChange = (location) => {
    // Find all matching paths
    let foundPaths = Router.routes.filter((pathObject) => matchPath(location.pathname, {
      path: pathObject.route,
      exact: true
    }));

    // If no matching path is found, fetch the not-found route definition
    if (foundPaths.length === 0 && location.pathname !== "not-found") {
      foundPaths = Router.routes.filter((pathObject) => matchPath("/not-found", {
        path: pathObject.route,
        exact: true
      }));
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
    let { search } = location;

    // Remove the ? if it exists at the beginning
    if (typeof search === "string" && search.startsWith("?")) {
      search = search.substr(1);
    }

    // Create object of all necessary data for the current route
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

    // The currentRoute is equal to the routeData.route that we just setup
    const currentRoute = routeData.route || {};

    // Get the previousRouteData, which is the Router.current() just before it changes.
    // Default to empty objects to guard against error
    const previousRouteData = Router.current() || {};
    const previousRoute = previousRouteData.route;

    // If routes are not identical, run onExit and onEnter
    if (!equal({
      params: previousRouteData.params,
      query: previousRouteData.query,
      route: previousRouteData.route
    }, {
      params: routeData.params,
      query: routeData.query,
      route: routeData.route
    })) {
      // Run onExit hooks if the previousRoute exists
      if (previousRoute) {
        Router.Hooks.run("onExit", "GLOBAL", previousRouteData);
        Router.Hooks.run("onExit", previousRoute.name, previousRouteData);
      }

      // Set current route reactive-var
      Router.setCurrentRoute(routeData);
      // Run on enter hooks for the new route
      Router.Hooks.run("onEnter", "GLOBAL", routeData);
      Router.Hooks.run("onEnter", currentRoute.name, routeData);
    }
    MetaData.init(routeData);
  }

  render() {
    return (
      <ReactRouter {...this.props} />
    );
  }
}

/**
 * @name getRootNode
 * @summary Loads and returns element for #react-root
 * @returns {Object} DOM element for #react-root
 */
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

/**
 * @name initBrowserRouter
 * @summary Renders app inside of Apollo and React Router HOCs
 * @returns {undefined}
 */
export function initBrowserRouter() {
  const apolloClient = initApollo();

  Router.initPackageRoutes({
    reactionContext: Reaction,
    indexRoute: Session.get("INDEX_OPTIONS") || {}
  });

  Router.Hooks.onEnter(MetaData.init);

  Tracker.autorun((computation) => {
    if (Router.ready()) {
      ReactDOM.render(
        (
          <ApolloProvider client={apolloClient}>
            <BrowserRouter history={history}>
              <TranslationProvider>
                <ComponentsProvider value={appComponents}>
                  <ThemeProvider theme={theme}>
                    <MuiThemeProvider theme={defaultTheme}>
                      <Components.App children={Router.reactComponents} />
                    </MuiThemeProvider>
                  </ThemeProvider>
                </ComponentsProvider>
              </TranslationProvider>
            </BrowserRouter>
          </ApolloProvider>
        ),
        getRootNode()
      );

      computation.stop();
    }
  });
}

export default BrowserRouter;
