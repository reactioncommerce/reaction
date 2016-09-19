import url from "url";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/kadira:flow-router-ssr";
import { Shops } from "/lib/collections";

/* eslint no-unused-vars: 0 */
//
//  TODO review this slugify import in lib/api/helpers
//
if (Meteor.isServer) {
  import { slugify } from "transliteration";
}

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
