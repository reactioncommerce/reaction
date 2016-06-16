import { BlazeLayout } from "meteor/kadira:blaze-layout";
import Router from "./main";

//
// Layout container uses body
//
BlazeLayout.setRoot("body");

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
  return Meteor.absoluteUrl(Router.pathFor(path, params).substr(1));
});

Template.registerHelper("active", Router.isActiveClassName);
