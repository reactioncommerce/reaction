import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

/**
 * shopIdAutoValue
 * @summary used for schema injection autoValue
 * @example autoValue: shopIdAutoValue
 * @return {String} returns current shopId
 */
export function shopIdAutoValue() {
  // we should always have a shopId
  if (this.isSet && Meteor.isServer) {
    return this.value;
  } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
    return Reaction.getShopId();
  }
  return this.unset();
}

/**
 * shopIdAutoValueForCart
 * @summary copy of shopIdAutoValue with modification for Cart
 * @example autoValue: shopIdAutoValue
 * @return {String} shopId
 */
export function shopIdAutoValueForCart() {
  // we should always have a shopId
  if (this.isSet && Meteor.isServer) {
    return this.value;
  } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
    let shopId = Reaction.getPrimaryShopId();
    const marketplaceSettings = Reaction.getMarketplaceSettings();

    if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantCart === true) {
      shopId = Reaction.getShopId();
    }
    return shopId;
  }
  return this.unset();
}

/**
 * schemaIdAutoValue
 * @summary used for schema injection autoValue
 * @example autoValue: schemaIdAutoValue
 * @return {String} returns randomId
 */
export function schemaIdAutoValue() {
  if (this.isSet && Meteor.isServer) {
    return this.value;
  } else if (Meteor.isServer && this.operator !== "$pull" ||
    Meteor.isClient && this.isInsert) {
    return Random.id();
  }
  return this.unset();
}

/**
 * shopDefaultCountry
 * @summary used for schema injection autoValue
 * @example autoValue: shopDefaultCountry
 * @return {String} returns country value from default shop
 */
export function shopDefaultCountry() {
  if (this.isSet && Meteor.isServer) {
    return this.value;
  } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
    const shop = Shops.findOne({
      _id: Reaction.getShopId()
    });
    if (shop && shop.addressBook && shop.addressBook[0]) {
      return shop.addressBook[0].country;
    }

    return this.value;
  }
  return this.unset();
}
