import url from "url";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/kadira:flow-router-ssr";
import { Shops } from "/lib/collections";

/* eslint no-unused-vars: 0 */

// Export Reaction using commonJS style for common libraries to use Reaction
// https://docs.meteor.com/packages/modules.html#CommonJS
let Reaction;

if (Meteor.isServer) {
  // TODO review this slugify import in lib/api/helpers
  import { slugify } from "transliteration";

  Reaction = require("/server/api").Reaction;
}
else if(Meteor.isClient) {
  Reaction = require("/client/api").Reaction;
}

export { Reaction };

/**
 * getShopId
 * @return {String} returns current shopId
 */
export function getShopId() {
  const domain = url.parse(Meteor.absoluteUrl()).hostname;

  const shop = Shops.find({ domains: { $in: [domain] }}, {
    limit: 1
  }).fetch()[0];

  return !!shop ? shop._id : null;
}


/**
 * getShopName
 * @return {String} returns current shop name
 */
export function getShopName() {
  const domain = url.parse(Meteor.absoluteUrl()).hostname;

  const shop = Shops.find({ domains: { $in: [domain] }}, {
    limit: 1
  }).fetch()[0];

  return !!shop ? shop.name : null;
}


/**
 * getSellerShopId
 * @param {String} userId - optional userId defaults to Meteor.userId()
 * @return {String} returns current user's shop id, null if not found
 */
export function getSellerShopId(userId) {
  const user = Meteor.users.findOne({ _id: userId });
  const domain = url.parse(Meteor.absoluteUrl()).hostname;

  let query = {
    domains: { $in: [domain] }
  };
  let shopId;

  if(user) {
    shopId = Roles.getGroupsForUser(userId, 'admin')[0];
    query._id = shopId;
  }

  const shop = Shops.find(query, {
    limit: 1
  }).fetch()[0];

  return !!shop ? shop._id : null;
}


/**
 * getCurrentTag
 * @return {String} returns current tag
 */
export function getCurrentTag() {
  if (FlowRouter.getRouteName() === "tag") {
    return FlowRouter.current().params.slug;
  }
  return null;
}


/**
 * getSlug - return a slugified string using "slugify" from transliteration
 * https://www.npmjs.com/package/transliteration
 * @param  {String} slugString - string to slugify
 * @return {String} slugified string
 */
export function getSlug(slugString) {
  return slugString ? slugify(slugString) : "";
}
