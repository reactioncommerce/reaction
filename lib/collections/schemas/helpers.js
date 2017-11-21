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

/**
 * shopDefaultParcelSize
 * @namespace
 * @memberof schemas
 * @method
 * @summary Helper method used for schema injection autoValue for product variant weight, length, width, and height
 * @example autoValue: weight
 * @return {String} parcel weight value from shop default parcel size
*/
export const shopDefaultParcelSize = {

  /**
   * A function in shopDefaultParcelSize (shopDefaultParcelSize.currentShop).
   * @function currentShop
   * @memberof shopDefaultParcelSize
   * @summary Function to get current shop from database
  */
  currentShop: function () {
    return Shops.findOne({
      _id: Reaction.getShopId()
    });
  },

  /**
   * A function in shopDefaultParcelSize (shopDefaultParcelSize.getParcelProperty).
   * @function getParcelProperty
   * @memberof shopDefaultParcelSize
   * @summary Function to get key value from shop default parcel size
  */
  getParcelProperty: function (property) {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
      const shop = new shopDefaultParcelSize.currentShop();
      if (shop && shop.defaultParcelSize) {
        return shop.defaultParcelSize[property];
      }
      return this.value;
    }
    return this.unset();
  },

  /**
   * A function in shopDefaultParcelSize (shopDefaultParcelSize.weight).
   * @function weight
   * @memberof shopDefaultParcelSize
   * @summary Function to get weight value from shop default parcel size
  */
  weight: function () {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
      const shop = new shopDefaultParcelSize.currentShop();
      if (shop && shop.defaultParcelSize) {
        return shop.defaultParcelSize.weight;
      }
      return this.value;
    }
    return this.unset();
  },

  /**
   * A function in shopDefaultParcelSize (shopDefaultParcelSize.length).
   * @function length
   * @memberof shopDefaultParcelSize
   * @summary Function to get length value from shop default parcel size
  */
  length: function () {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
      const shop = new shopDefaultParcelSize.currentShop();
      if (shop && shop.defaultParcelSize) {
        return shop.defaultParcelSize.length;
      }
      return this.value;
    }
    return this.unset();
  },

  /**
   * A function in shopDefaultParcelSize (shopDefaultParcelSize.width).
   * @function width
   * @memberof shopDefaultParcelSize
   * @summary Function to get width value from shop default parcel size
  */
  width: function () {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
      const shop = new shopDefaultParcelSize.currentShop();
      if (shop && shop.defaultParcelSize) {
        return shop.defaultParcelSize.width;
      }
      return this.value;
    }
    return this.unset();
  },

  /**
   * A function in shopDefaultParcelSize (shopDefaultParcelSize.height).
   * @function height
   * @memberof shopDefaultParcelSize
   * @summary Function to get height value from shop default parcel size
  */
  height: function () {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer && !this.isUpdate || Meteor.isClient && this.isInsert) {
      const shop = new shopDefaultParcelSize.currentShop();
      if (shop && shop.defaultParcelSize) {
        return shop.defaultParcelSize.height;
      }
      return this.value;
    }
    return this.unset();
  }
};
