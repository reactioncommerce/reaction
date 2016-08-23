import { i18next } from "/client/api";
import { Reaction } from "../";
import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import moment from "moment-timezone";

/*
 *
 * Reaction Spacebars helpers
 * See: http://docs.meteor.com/#/full/template_registerhelper
 *
 */

Template.registerHelper("Collections", function () {
  return Collections;
});

Template.registerHelper("Schemas", function () {
  return Schemas;
});

/**
 * currentUser
 * @summary overrides Meteor Package.blaze currentUser method
 * @return {[Boolean]} returns true/null if user has registered
 */
if (Package.blaze) {
  Package.blaze.Blaze.Template.registerHelper("currentUser", function () {
    if (typeof Reaction === "object") {
      const shopId = Reaction.getShopId();
      const user = Accounts.user();
      if (!shopId || typeof user !== "object") return null;
      // shoppers should always be guests
      const isGuest = Roles.userIsInRole(user, "guest", shopId);
      // but if a user has never logged in then they are anonymous
      const isAnonymous = Roles.userIsInRole(user, "anonymous", shopId);

      return isGuest && !isAnonymous ? user : null;
    }
    return null;
  });
}

/**
 * registerHelper monthOptions
 * @summary formats moment.js months into an array for autoform selector
 * @return {Array} returns array of months [value:, label:]
 */
Template.registerHelper("monthOptions", function () {
  const label = i18next.t("app.monthOptions", "Choose month");
  const monthOptions = [{
    value: "",
    label: label
  }];
  const months = moment.months();
  for (const index in months) {
    if ({}.hasOwnProperty.call(months, index)) {
      const month = months[index];
      monthOptions.push({
        value: parseInt(index, 10) + 1,
        label: month
      });
    }
  }
  return monthOptions;
});

/**
 * yearOptions
 * @summary formats moment.js next 9 years into array for autoform selector
 * @return {Array} returns array of years [value:, label:]
 */
Template.registerHelper("yearOptions", function () {
  const label = i18next.t("app.yearOptions", "Choose year");
  const yearOptions = [{
    value: "",
    label: label
  }];
  let year = new Date().getFullYear();
  for (let i = 1; i < 9; i++) {
    yearOptions.push({
      value: year,
      label: year
    });
    year++;
  }
  return yearOptions;
});

/**
 * timezoneOptions
 * @summary formats moment.js timezones into array for autoform selector
 * @return {Array} returns array of timezones [value:, label:]
 */
Template.registerHelper("timezoneOptions", function () {
  const label = i18next.t("app.timezoneOptions", "Choose timezone");
  const timezoneOptions = [{
    value: "",
    label: label
  }];
  const timezones = moment.tz.names();
  for (const timezone of timezones) {
    timezoneOptions.push({
      value: timezone,
      label: timezone
    });
  }
  return timezoneOptions;
});


/**
 * camelToSpace
 * @summary convert a camelcased string to spaces
 * @param {String} str - camelcased string
 * @return {String} returns space formatted string
 */
Template.registerHelper("camelToSpace", function (str) {
  const downCamel = str.replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1 $2");
  return downCamel.toLowerCase();
});

/**
 * toLowerCase
 * @summary convert a string to lower case
 * @param {String} str - string
 * @return {String} returns lowercased string
 */
Template.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

/**
 * toUpperCase
 * @summary convert a string to upper case
 * @param {String} str - string
 * @return {String} returns uppercased string
 */
Template.registerHelper("toUpperCase", function (str) {
  return str.toUpperCase();
});

/**
 * capitalize
 * @summary capitalize first character of string
 * @param {String} str - string
 * @return {String} returns string with first letter capitalized
 */
Template.registerHelper("capitalize", function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/**
 * toCamelCase
 * @summary camelCases a string
 * @param {String} str - string
 * @return {String|undefined} returns camelCased string
 */
Template.registerHelper("toCamelCase", function (str) {
  return !!str && str.toCamelCase();
});


/**
 * siteName
 * @summary get the shop name
 * @return {String} returns site name
 */
Template.registerHelper("siteName", function () {
  const shop = Collections.Shops.findOne();
  return typeof shop === "object" && shop.name ? shop.name : "";
});

/*
 *  General helpers for template functionality
 */

/**
 * condition
 * @summary conditional string comparison template helper
 * @example {{#if condition status "eq" ../value}}
 * @param {String} v1 - first variable to compare
 * @param {String} operator - eq,neq,ideq,or,lt,gt comparision operator
 * @param {String} v2 - second variable to compare
 * @return {Boolean} returns true/false
 */
Template.registerHelper("condition", function (v1, operator, v2) {
  switch (operator) {
    case "==":
    case "eq":
      return v1 === v2;
    case "!=":
    case "neq":
      return v1 !== v2;
    case "===":
    case "ideq":
      return v1 === v2;
    case "!==":
    case "nideq":
      return v1 !== v2;
    case "&&":
    case "and":
      return v1 && v2;
    case "||":
    case "or":
      return v1 || v2;
    case "<":
    case "lt":
      return v1 < v2;
    case "<=":
    case "lte":
      return v1 <= v2;
    case ">":
    case "gt":
      return v1 > v2;
    case ">=":
    case "gte":
      return v1 >= v2;
    default:
      throw new Meteor.Error(`Undefined conditional operator ${operator}`);
  }
});

/**
 * orElse
 * @summary if this is true, or else this
 * @param {String} v1 - variable one
 * @param {String} v2 - variable two
 * @return {String} returns v1 || v2
 */
Template.registerHelper("orElse", function (v1, v2) {
  return v1 || v2;
});

/**
 * key_value
 * @summary template helper pushing object key/value into array
 * @param {Object} context - object to parse into key / value
 * @return {Array} returns array[key:,value:]
 */
Template.registerHelper("key_value", function (context) {
  const result = [];
  _.each(context, function (value, key) {
    return result.push({
      key: key,
      value: value
    });
  });
  return result;
});

/**
 * nl2br
 * @summary template helper nl2br - Converts new line (\n\r) to <br>
 * from http://phpjs.org/functions/nl2br:480
 * @param {String} text - text
 * @returns {String} returns formatted Spacebars.SafeString
 */
Template.registerHelper("nl2br", function (text) {
  const nl2br = (text + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" +
    "<br>" + "$2");
  return new Spacebars.SafeString(nl2br);
});

/**
 * dateFormat
 * @description
 * format an ISO date using Moment.js
 * http://momentjs.com/
 * moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
 * @example {{dateFormat creation_date format="MMMM YYYY"}}
 * @param {String} context - moment context
 * @param {String} block - hash of moment options, ie: format=""
 * @return {Date} return formatted date
 */
Template.registerHelper("dateFormat", function (context, block) {
  if (window.moment) {
    const f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  }
  return context;
});

/**
 * timeAgo
 * @description
 * accept an ISO date using Moment.js and return elapsed time from today
 * http://momentjs.com/
 * moment syntax example: moment(Date("2011-07-18T15:50:52")).from(new Date())
 * @example {{timeAgo creation_date}}
 * @param {String} context - moment context
 * @return {Date} return formatted date
 */
Template.registerHelper("timeAgo", function (context) {
  if (window.moment) {
    return moment(context).from(new Date());
  }
  return context;
});


/**
 * pluralize
 * @summary general helper for plurization of strings
 * @example {{plurize "1 thing"}}
 * @param {String} nCount - number, ie "1 "
 * @param {String} pString - plural string ie " thing"
 * @todo adapt to, and use i18next
 */
Template.registerHelper("pluralize", function (nCount, pString) {
  if (nCount === 1) {
    return "1 " + pString;
  }
  return nCount + " " + pString + "s";
});
