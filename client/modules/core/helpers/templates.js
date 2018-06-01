import _ from "lodash";
import "moment/min/locales.min.js";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base";
import { Spacebars } from "meteor/spacebars";
import { ReactiveVar } from "meteor/reactive-var";
import { Roles } from "meteor/alanning:roles";
import { i18next, Reaction } from "/client/api";
import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { toCamelCase } from "/lib/api";

/**
 * @file Meteor Blaze Template helper methods - Use these helpers in Meteor Blaze templates with `{{ }}`
 * Read more about Meteor Blaze helpers in the [Blaze Documentation](blazejs.org/api/templates.html#Template-registerHelper).
 * @namespace BlazeTemplateHelpers
 */

// Lazily load moment-timezone.months
const monthOptionsVar = new ReactiveVar([]);
async function lazyLoadMonths() {
  if (monthOptionsVar.get().length) return;
  const { locale, months } = await import("moment-timezone");

  let lang = i18next.language;
  if (lang === "zh") {
    lang = "zh-cn";
  }

  locale(lang);

  const monthOptions = [];
  const monthsList = months();

  // parse into autoform array
  for (const index in monthsList) {
    if ({}.hasOwnProperty.call(monthsList, index)) {
      const month = monthsList[index];
      const mnum = parseInt(index, 10) + 1;
      monthOptions.push({
        value: mnum,
        label: `${mnum} | ${month}`
      });
    }
  }

  monthOptionsVar.set(monthOptions);
}

Template.registerHelper("Collections", () => Collections);

Template.registerHelper("Schemas", () => Schemas);

/**
 * @method currentUser
 * @memberof BlazeTemplateHelpers
 * @summary overrides Meteor Package.blaze currentUser method
 * @return {Boolean} returns true/null if user has registered
 */
Template.registerHelper("currentUser", () => {
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

/**
 * @method monthOptions
 * @memberof BlazeTemplateHelpers
 * @summary Get monthOptionsVar ReactiveVar
 * @param {Boolean} [showDefaultOption]
 * @return {Array} returns array of months
 */
Template.registerHelper("monthOptions", (showDefaultOption = true) => {
  const label = i18next.t("app.monthOptions", "Choose month");

  // Call to get monthOptionsVar ReactiveVar
  lazyLoadMonths();
  let monthOptions = [];

  if (showDefaultOption) {
    monthOptions.push({
      value: "",
      label
    });
  }

  monthOptions = monthOptions.concat(monthOptionsVar.get());

  return monthOptions;
});

/**
 * @method yearOptions
 * @memberof BlazeTemplateHelpers
 * @summary formats moment.js next 9 years into array for autoform selector
 * @param {Boolean} [showDefaultOption]
 * @return {Array} returns array of years [value:, label:]
 */
Template.registerHelper("yearOptions", (showDefaultOption = true) => {
  const label = i18next.t("app.yearOptions", "Choose year");
  const yearOptions = [];

  if (showDefaultOption) {
    yearOptions.push({
      value: "",
      label
    });
  }

  let year = new Date().getFullYear();
  for (let i = 1; i < 9; i += 1) {
    yearOptions.push({
      value: year,
      label: year
    });
    year += 1;
  }
  return yearOptions;
});

/**
 * @method camelToSpace
 * @summary convert a camelcased string to spaces
 * @param {String} str - camelcased string
 * @return {String} returns space formatted string
 */
Template.registerHelper("camelToSpace", (str) => {
  const downCamel = str.replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1 $2");
  return downCamel.toLowerCase();
});

/**
 * @method toLowerCase
 * @memberof BlazeTemplateHelpers
 * @summary convert a string to lower case
 * @param {String} str - string
 * @return {String} returns lowercased string
 */
Template.registerHelper("toLowerCase", (str) => str.toLowerCase());

/**
 * @method toUpperCase
 * @memberof BlazeTemplateHelpers
 * @summary convert a string to upper case
 * @param {String} str - string
 * @return {String} returns uppercased string
 */
Template.registerHelper("toUpperCase", (str) => str.toUpperCase());

/**
 * @method capitalize
 * @memberof BlazeTemplateHelpers
 * @summary capitalize first character of string
 * @param {String} str - string
 * @return {String} returns string with first letter capitalized
 */
Template.registerHelper("capitalize", (str) => str.charAt(0).toUpperCase() + str.slice(1));

/**
 * @method toCamelCase
 * @memberof BlazeTemplateHelpers
 * @summary camelCases a string
 * @param {String} str - string
 * @return {String|undefined} returns camelCased string
 */
Template.registerHelper("toCamelCase", (str) => !!str && toCamelCase(str));


/**
 * @method siteName
 * @memberof BlazeTemplateHelpers
 * @summary get the shop name
 * @example <a href="{{pathFor 'index'}}"><span>{{siteName}}</span></a>
 * @return {String} returns site name
 */
Template.registerHelper("siteName", () => {
  const shop = Collections.Shops.findOne();
  return typeof shop === "object" && shop.name ? shop.name : "";
});

/**
 * @method condition
 * @summary conditional string comparison template helper
 * @example {{#if condition status "eq" ../value}}
 * @memberof BlazeTemplateHelpers
 * @param {String} v1 - first variable to compare
 * @param {String} operator - eq,neq,ideq,or,lt,gt comparision operator
 * @param {String} v2 - second variable to compare
 * @return {Boolean} returns true/false
 */
Template.registerHelper("condition", (v1, operator, v2) => {
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
      throw new Meteor.Error("undefined-operator", `Undefined conditional operator ${operator}`);
  }
});

/**
 * @method orElse
 * @summary if this is true, or else this
 * @memberof BlazeTemplateHelpers
 * @example {{#if showCartIconWarning}}
  <div class="badge badge-warning">!</div>
  {{/if}}
  <div class="badge">{{orElse cartCount 0}}</div>
 * @param {String} v1 - variable one
 * @param {String} v2 - variable two
 * @return {String} returns v1 || v2
 */
Template.registerHelper("orElse", (v1, v2) => v1 || v2);

/**
 * @method key_value
 * @summary template helper pushing object key/value into array
 * @memberof BlazeTemplateHelpers
 * @param {Object} context - object to parse into key / value
 * @return {Array} returns array[key:,value:]
 */
Template.registerHelper("key_value", (context) => {
  const result = [];
  _.each(context, (value, key) => result.push({
    key,
    value
  }));
  return result;
});

/**
 * @method nl2br
 * @summary template helper nl2br - Converts new line (\n\r) to <br>
 * from http://phpjs.org/functions/nl2br:480
 * @memberof BlazeTemplateHelpers
 * @param {String} text - text
 * @returns {String} returns formatted Spacebars.SafeString
 */
Template.registerHelper("nl2br", (text) => {
  const nl2br = (`${text}`).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1<br>$2");
  return new Spacebars.SafeString(nl2br);
});

/**
 * @method pluralize
 * @summary general helper for plurization of strings
 * @memberof BlazeTemplateHelpers
 * @example {{pluralize "1 thing"}}
 * @param {String} nCount - number, ie "1 "
 * @param {String} pString - plural string ie " thing"
 * @todo adapt to, and use i18next
 */
Template.registerHelper("pluralize", (nCount, pString) => {
  if (nCount === 1) {
    return `1 ${pString}`;
  }
  return `${nCount} ${pString}s`;
});
