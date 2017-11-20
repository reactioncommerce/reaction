import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import Router from "./main";

//
// pathFor
// template helper to return path
//
Template.registerHelper("pathFor", Router.pathFor);

//
// urlFor
// template helper to return absolute + path
//
Template.registerHelper("urlFor", (path, params) => Reaction.absoluteUrl(Router.pathFor(path, params).substr(1)));

Template.registerHelper("active", Router.isActiveClassName);
