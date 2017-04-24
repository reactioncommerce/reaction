import _ from "lodash";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Tracker } from "meteor/tracker";
// import { FlowRouter as Router } from "meteor/kadira:flow-router-ssr";
import React, { Component, PropTypes } from "react"
import ReactDOM from "react-dom"
import { matchPath } from 'react-router'
import { Router as ReactRouter, Route } from "react-router-dom";
import createHistory from 'history/createBrowserHistory'
import { Reaction } from "/client/api";

import { MetaData } from "/lib/api/router/metadata";

import { getComponent } from "/imports/plugins/core/layout/lib/components";

import Blaze from "meteor/gadicc:blaze-react-component";
import pathToRegexp from "path-to-regexp"
import queryParse from "query-parse";

// const Router = BrowserRouter

import App from "/imports/plugins/core/router/client/app"
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
    // const { store:propsStore, history } = this.props
    // this.store = propsStore || this.context.store

    this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
    this.handleLocationChange(history.location);
  }

  componentDidMount() {
    console.log("Moutning already???", history.location);
    // this.handleLocationChange(history.location);

    this.handleLocationChange(history.location);
  }

  componentWillUnmount() {
    if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
  }

  handleLocationChange = location => {
    const foundPath = Router.routes.find((pathObject) => {
      return matchPath(location.pathname, {
        path: pathObject.route
      });
    });

    const params = {};
    let route = {};

    if (foundPath) {
      const keys = [];
      const re = pathToRegexp(foundPath.route, keys);
      const values = re.exec(location.pathname);

      keys.forEach((key, index) => {
        params[key.name] = values[index + 1];
      });

      console.log("### FOUND ###", foundPath, params, keys);
    }

    let search = location.search;

    if (typeof search === "string" && search.startsWith("?")) {
      search = search.substr(1);
    }

    console.log("params", params);

    Router.currentRoute.set({
      route: {
        ...foundPath,
        path: location.pathname
      },
      params,
      query: queryParse.toObject(search),
      payload: location
    });

    // Router.Hooks.run()
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
