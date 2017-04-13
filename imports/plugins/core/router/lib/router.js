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

// const Router = BrowserRouter

export let history;


if (Meteor.isClient) {
  history = createBrowserHistory();
} else {
  history = createMemoryHistory();
}

const currentRoute = new ReactiveVar({});


class Router {
  static getParam() {
    return "";
  }

  static current() {
    return currentRoute.get();
  }

  static getRouteName() {
    const current = this.current();

    return current.options && current.options.name || "";
  }

  static set currentRoute(data) {
    currentRoute.set(data);
  }
}

// init flow-router
//
/* eslint no-loop-func: 0 */

// client should wait on subs
// Router.wait();
//
Router.history = history
Router.Hooks = Hooks;

Router.paths = [];

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

  const foundPath = Router.paths.find((pathObject) => {
    // console.log(pathObject.options.name, path);
    if (pathObject.options.name === path) {
      return true;
    }
    return false;
  })

  if (foundPath) {
    //
    // const m = matchPath(foundPath.route, {
    //   options.hash
    // })
    // console.log("match path", foundPath.route, m);


    const toPath = pathToRegexp.compile(foundPath.route);
    const compiledPath = toPath(options.hash);

    return compiledPath;
  }

  return "/";
};


Router.go = (path, params) => {
  const actualPath = Router.pathFor(path, {
    hash: params
  })
  // console.log(actualPath);

  if (window) {
    history.push(actualPath)
  }
};


Router.getParam = function (name) {
  const current = currentRoute.get();

  return current.params && current.params[name] || undefined;
};

Router.getQueryParam = function (name) {
  console.warn("Not-yet implemented. Query param for:", name)
  return "";
};

/**
 * isActive
 * @summary general helper to return "active" when on current path
 * @example {{active "name"}}
 * @param {String} routeName - route name as defined in registry
 * @return {String} return "active" or null
 */
Router.isActiveClassName = (routeName) => {
  // Router.watchPathChange();
  // const group = Router.current().route.group;
  // let prefix;
  // if (group && group.prefix) {
  //   prefix = Router.current().route.group.prefix;
  // } else {
  //   prefix = "";
  // }
  // const path = Router.current().route.path;
  // const routeDef = path.replace(prefix + "/", "");
  // return routeDef === routeName ? "active" : "";
  return ""
};

export default Router;
