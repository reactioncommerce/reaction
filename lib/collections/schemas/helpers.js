import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

/**
 * @name shopIdAutoValue
 * @memberof schemas
 * @method
 * @summary Helper method used for schema injection autoValue
 * @example autoValue: shopIdAutoValue
 * @return {String} current shopId
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
 * @name shopIdAutoValueForCart
 * @memberof schemas
 * @method
 * @summary Helper method copy of shopIdAutoValue with modification for Cart
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
 * @name schemaIdAutoValue
 * @memberof schemas
 * @method
 * @summary Helper method used for schema injection autoValue
 * @example autoValue: schemaIdAutoValue
 * @return {String} randomId
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
 * @name shopDefaultCountry
 * @memberof schemas
 * @method
 * @summary Helper method used for schema injection autoValue
 * @example autoValue: shopDefaultCountry
 * @return {String} country value from default shop
 */
export function shopDefaultCountry() {
  try {
    // Check to see if this is client or server, and the type of update being performed
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
      // Find the current shop
      const shop = Shops.findOne({
        _id: Reaction.getShopId()
      });

      // Find the current shops primary shipping address
      if (shop && shop.addressBook) {
        const defaultShippingAddress = shop.addressBook.find((address) => {
          return address.isShippingDefault === true;
        });

        // return the shops country to auto-populate the Country of Origin field in the scheme
        return defaultShippingAddress.country;
      }

      return this.value;
    }
    return this.unset();
  } catch (e) {
    return this.value;
  }
}
