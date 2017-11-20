import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import Router from "./main";
import { Reaction } from "/lib/api";

//
// pathFor
// template helper to return path
//
Template.registerHelper("pathFor", Router.pathFor);

//
// urlFor
// template helper to return absolute + path
//
Template.registerHelper("urlFor", (path, params) => {
  return Reaction.absoluteUrl(Router.pathFor(path, params).substr(1));
});

Template.registerHelper("active", Router.isActiveClassName);
