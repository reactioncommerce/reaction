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
  static paths = []


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

// init flow-router
//
/* eslint no-loop-func: 0 */

// client should wait on subs
// Router.wait();
//
// Router.history = history
// Router.Hooks = Hooks;
//
// Router.paths = [];

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

  const routeDef = path.replace(prefix + "/", "");

  return routeDef === routeName ? "active" : "";
};

export default Router;
