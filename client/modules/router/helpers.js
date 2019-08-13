import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import Router from "./main";

/**
 * @method pathFor
 * @memberof BlazeTemplateHelpers
 * @summary template helper to return path
 * @returns {String} username
 */
Template.registerHelper("pathFor", Router.pathFor);

/**
 * @method urlFor
 * @memberof BlazeTemplateHelpers
 * @summary template helper to return absolute + path
 * @returns {String} username
 */
Template.registerHelper("urlFor", (path, params) => Reaction.absoluteUrl(Router.pathFor(path, params).substr(1)));

/**
 * @method active
 * @memberof BlazeTemplateHelpers
 * @summary template helper for `Router.isActiveClassName`
 * @returns {String} username
 */
Template.registerHelper("active", Router.isActiveClassName);
