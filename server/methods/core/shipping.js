import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Cart, Accounts } from "/lib/collections";
import { Logger, Hooks } from "/server/api";
import { Cart as CartSchema } from "/lib/collections/schemas";

/**
 * @file Methods for Shipping - methods typically used for checkout (shipping, taxes, etc).
 * Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Methods/Shipping
*/

/**
 * @name createShipmentQuotes
 * @private
 * @summary Returns object with shipping object with `requestStatus` as `pending`
 * @param  {String} cartId ID
 * @param  {String} shopId ID
 * @param  {Object} rates  Shipping rates
 * @return {Object}        Update object with `shipping` object.
 */
function createShipmentQuotes(cartId, shopId, rates) {
  let update = {
    $push: {
      shipping: {
        shopId,
        shipmentQuotes: [],
        shipmentQuotesQueryStatus: {
          requestStatus: "pending"
        }
      }
    }
  };

  try {
    Cart.update({ _id: cartId }, update);
  } catch (error) {
    Logger.warn(`Error in setting shipping query status to "pending" for ${cartId}`, error);
    throw error;
  }

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

  Logger.debug(`Success in setting shipping query status to "pending" for ${cartId}`, rates);

  if (rates.length === 1 && rates[0].requestStatus === "error") {
    const errorDetails = rates[0];
    update = {
      $set: {
        "shipping.$.shipmentQuotes": [],
        "shipping.$.shipmentQuotesQueryStatus": {
          requestStatus: errorDetails.requestStatus,
          shippingProvider: errorDetails.shippingProvider,
          message: errorDetails.message
        }
      }
    };
  }

  if (rates.length > 0 && rates[0].requestStatus === undefined) {
    update = {
      $set: {
        "shipping.$.shipmentQuotes": rates,
        "shipping.$.shipmentQuotesQueryStatus": {
          requestStatus: "success",
          numOfShippingMethodsFound: rates.length
        }
      }
    };
  }

  return update;
}

/**
 * @name pruneShippingRecordsByShop
 * @private
 * @summary if we have items in the cart, ensure that we only have shipping records
 * for shops currently represented in the cart
 * @param {Object} cart - The cart to operate on
 * @returns {undefined} undefined
 * @private
 */
function pruneShippingRecordsByShop(cart) {
  if (cart.items) {
    const cartId = cart._id;
    const itemsByShop = cart.getItemsByShop();
    const shops = Object.keys(itemsByShop);
    if (shops.length > 0 && cart.items.length > 0) {
      Cart.update(
        { _id: cartId },
        {
          $pull: {
            shipping: { shopId: { $nin: shops } }
          }
        }
      );
    } else {
      Cart.update(
        { _id: cartId },
        {
          $unset: {
            shipping: ""
          }
        }
      );
    }

    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);
  }
}

/**
 * @name normalizeAddresses
 * @summary - When adding shipping records, ensure that each record has an address
 * @param {Object} cart - The Cart object we need to operate on
 * @returns {undefined} undefined
 * @private
 */
function normalizeAddresses(cart) {
  if (cart.shipping && cart.shipping.length > 0) {
    const { shipping } = cart;
    const cartId = cart._id;
    let address; // we can only have one address so whatever was the last assigned
    shipping.forEach((shippingRecord) => {
      if (shippingRecord.address) {
        ({ address } = shippingRecord);
      }
    });
    const shopIds = Object.keys(cart.getItemsByShop());
    shopIds.forEach((shopId) => {
      const selector = {
        "_id": cartId,
        "shipping.shopId": shopId
      };

      const update = {
        $set: {
          "shipping.$.address": address
        }
      };
      Cart.update(selector, update);
      // Calculate discounts
      Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);
    });
  }
}

/**
 * @name updateShipmentQuotes
 * @param  {String} cartId   Cart ID
 * @param  {Object} rates    Rate object
 * @param  {Object} selector Selector
 * @return {Object}          Update
 * @private
 */
function updateShipmentQuotes(cartId, rates, selector) {
  let update = {
    $set: {
      "shipping.$.shipmentQuotesQueryStatus": {
        requestStatus: "pending"
      }
    }
  };

  try {
    Cart.update(selector, update);
  } catch (error) {
    Logger.warn(`Error in setting shipping query status to "pending" for ${cartId}`, error);
    throw error;
  }

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

  Logger.debug(`Success in setting shipping query status to "pending" for ${cartId}`, rates);

  if (rates.length === 1 && rates[0].requestStatus === "error") {
    const errorDetails = rates[0];
    update = {
      $set: {
        "shipping.$.shipmentQuotes": [],
        "shipping.$.shipmentQuotesQueryStatus": {
          requestStatus: errorDetails.requestStatus,
          shippingProvider: errorDetails.shippingProvider,
          message: errorDetails.message
        }
      }
    };
  }

  if (rates.length > 0 && rates[0].requestStatus === undefined) {
    update = {
      $set: {
        "shipping.$.shipmentQuotes": rates,
        "shipping.$.shipmentQuotesQueryStatus": {
          requestStatus: "success",
          numOfShippingMethodsFound: rates.length
        }
      }
    };
  }

  return update;
}

/**
 * @name updateShippingRecordByShop
 * @param  {Object} cart  Cart object
 * @param  {Object} rates Rate object
 * @return {null}
 * @private
 */
function updateShippingRecordByShop(cart, rates) {
  const cartId = cart._id;
  const itemsByShop = cart.getItemsByShop();

  const shops = Object.keys(itemsByShop);
  shops.forEach((shopId) => {
    const selector = {
      "_id": cartId,
      "shipping.shopId": shopId
    };
    const cartForShipping = Cart.findOne(selector);

    // we may have added a new shop since the last time we did this, if so we need to add a new record
    let update;
    if (cartForShipping) {
      update = updateShipmentQuotes(cartId, rates, selector);
    } else {
      update = createShipmentQuotes(cartId, shopId, rates);
    }

    try {
      Cart.update(selector, update);
    } catch (error) {
      Logger.warn(`Error updating rates for cart ${cartId}`, error);
      throw error;
    }

    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

    Logger.debug(`Success updating rates for cart ${cartId}`, rates);
  });

  pruneShippingRecordsByShop(cart);
  normalizeAddresses(cart);
}

/**
 * @name getDefaultAddress
 * @param  {Object} cart [description]
 * @return {Object} address
 * @private
 */
function getDefaultAddress(cart) {
  const { userId } = cart;
  const account = Accounts.findOne(userId);
  if (account && account.profile && account.profile.addressBook) {
    const address = account.profile.addressBook.find((addressEntry) => addressEntry.isShippingDefault === true);
    return address;
  }
}

/**
 * @name addAddresses
 * @summary Add the default address to the cart
 * @param {Object} cart - the cart to modify
 * @returns {undefined}
 * @private
 */
function addAddresses(cart) {
  const address = getDefaultAddress(cart);
  if (address) {
    const shopIds = Object.keys(cart.getItemsByShop());
    shopIds.forEach((shopId) => {
      Cart.update({
        _id: cart._id
      }, {
        $push: {
          shipping: {
            shopId,
            address
          }
        }
      });
    });
  }
}

export const methods = {
  /**
   * @name shipping/updateShipmentQuotes
   * @method
   * @memberof Methods/Shipping
   * @summary Gets shipping rates and updates the users cart methods
   * @todo Add orderId argument/fallback
   * @param {String} cartId - cartId
   * @return {undefined}
   */
  "shipping/updateShipmentQuotes"(cartId) {
    check(cartId, String);
    if (!cartId) {
      return [];
    }
    this.unblock();
    let cart = Cart.findOne(cartId);
    CartSchema.validate(cart);

    if (cart) {
      if (!cart.shipping || cart.shipping.length === 0) {
        addAddresses(cart);
        cart = Cart.findOne(cartId);
      }
      const rates = Meteor.call("shipping/getShippingRates", cart);
      updateShippingRecordByShop(cart, rates);
    }
  },

  /**
   * @name shipping/getShippingRates
   * @method
   * @memberof Methods/Shipping
   * @summary Just gets rates, without updating anything
   * @param {Object} cart - cart object
   * @return {Array} return updated rates in cart
   */
  "shipping/getShippingRates"(cart) {
    CartSchema.validate(cart);
    const rates = [];
    const retrialTargets = [];
    // must have items to calculate shipping
    if (!cart.items || !cart.items.length) {
      return rates;
    }
    // hooks for other shipping rate events
    // all callbacks should return rates
    Hooks.Events.run("onGetShippingRates", [rates, retrialTargets], cart);

    // Try once more.
    if (retrialTargets.length > 0) {
      Hooks.Events.run("onGetShippingRates", [rates, retrialTargets], cart);

      if (retrialTargets.length > 0) {
        Logger.warn("Failed to get shipping methods from these packages:", retrialTargets);
      }
    }

    let newRates = rates.filter(({ requestStatus }) => requestStatus !== "error");
    if (newRates.length === 0) {
      newRates = [{
        requestStatus: "error",
        shippingProvider: "all",
        message: "All requests for shipping methods failed."
      }];
    }

    Logger.debug("getShippingRates returning rates", rates);
    return newRates;
  }
};

Meteor.methods(methods);
