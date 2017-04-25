import { Session } from "meteor/session";
import { Tracker } from "meteor/tracker";
import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";
import { matchPath } from "react-router";
import { Router as ReactRouter } from "react-router-dom";
import { Reaction } from "/client/api";
import pathToRegexp from "path-to-regexp";
import queryParse from "query-parse";
import App from "/imports/plugins/core/router/client/app";
import { Router } from "../lib";

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
    const foundPath = Router.routes.find((pathObject) => {
      return matchPath(location.pathname, {
        path: pathObject.route,
        exact: true
      });
    });

    const params = {};

    if (foundPath) {
      const keys = [];
      const re = pathToRegexp(foundPath.route, keys);
      const values = re.exec(location.pathname);

      keys.forEach((key, index) => {
        params[key.name] = values[index + 1];
      });
    }

    let search = location.search;

    if (typeof search === "string" && search.startsWith("?")) {
      search = search.substr(1);
    }

    Router.currentRoute.set({
      route: {
        ...foundPath,
        path: location.pathname
      },
      params,
      query: queryParse.toObject(search),
      payload: location
    });
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

  Tracker.autorun(() => {
    if (Router.ready()) {
      ReactDOM.render((
        <BrowserRouter history={history} >
          <App children={Router.reactComponents} />
        </BrowserRouter>
      ), getRootNode());
    }
  });
}

export default BrowserRouter;
