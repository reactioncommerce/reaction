import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Cart } from "/lib/collections";
import { Logger, Hooks } from "/server/api";
import { Cart as CartSchema } from "/lib/collections/schemas";

function createShipmentQuotes(cartId, shopId, rates, selector) {
  let update = {
    $push: {
      shipping: {
        shopId: shopId,
        shipmentQuotes: rates,
        shipmentQuotesQueryStatus: {
          requestStatus: "pending"
        }
      }
    }
  };
  Cart.update(selector, update, function (error) {
    if (error) {
      Logger.warn(`Error in setting shipping query status to "pending" for ${cartId}`, error);
      return;
    }
    Logger.debug(`Success in setting shipping query status to "pending" for ${cartId}`, rates);
  });

  if (rates.length === 1 && rates[0].requestStatus === "error") {
    const errorDetails = rates[0];
    update = {
      $push: {
        shipping: {
          shopId: shopId,
          shipmentQuotes: [],
          shipmentQuotesQueryStatus: {
            requestStatus: errorDetails.requestStatus,
            shippingProvider: errorDetails.shippingProvider,
            message: errorDetails.message
          }
        }
      }
    };
  }

  if (rates.length > 0 && rates[0].requestStatus === undefined) {
    update = {
      $push: {
        shipping: {
          shopId: shopId,
          shipmentQuotes: rates,
          shipmentQuotesQueryStatus: {
            requestStatus: "success",
            numOfShippingMethodsFound: rates.length
          }
        }
      }
    };
  }

  return update;
}

function createShippingRecordByShop(cart, rates) {
  const cartId = cart._id;
  const itemsByShop = cart.getItemsByShop();
  const shops = Object.keys(itemsByShop);
  const selector = { _id: cartId };
  shops.map((shopId) => {
    const update = createShipmentQuotes(cartId, shopId, rates, selector);
    return Cart.update(selector, update, (error) => {
      if (error) {
        Logger.error(`Error adding rates to cart from createShippingRecordByShop ${cartId}`, error);
        return;
      }
      Logger.debug(`Success adding rates to cart ${cartId}`, rates);
    });
  });
}

function updateShipmentQuotes(cartId, rates, selector) {
  let update = {
    $set: {
      "shipping.0.shipmentQuotesQueryStatus": {
        requestStatus: "pending"
      }
    }
  };
  Cart.update(selector, update, function (error) {
    if (error) {
      Logger.warn(`Error in setting shipping query status to "pending" for ${cartId}`, error);
      return;
    }
    Logger.debug(`Success in setting shipping query status to "pending" for ${cartId}`, rates);
  });

  if (rates.length === 1 && rates[0].requestStatus === "error") {
    const errorDetails = rates[0];
    update = {
      $set: {
        "shipping.0.shipmentQuotes": [],
        "shipping.0.shipmentQuotesQueryStatus": {
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

function updateShippingRecordByShop(cart, rates) {
  const cartId = cart._id;
  const itemsByShop = cart.getItemsByShop();
  const shops = Object.keys(itemsByShop);
  let update;
  let selector;
  shops.map((shopId) => {
    selector = {
      "_id": cartId,
      "shipping.shopId": shopId
    };
    const shippingRecord = Cart.findOne(selector);
    // we may have added a new shop since the last time we did this, if so we need to add a new record

    if (shippingRecord) {
      update = updateShipmentQuotes(cartId, rates, selector);
    } else {
      selector = { _id: cartId };
      update = createShipmentQuotes(cartId, shopId, rates, selector);
    }

    Cart.update(selector, update, function (error) {
      if (error) {
        Logger.warn(`Error updating rates for cart ${cartId}`, error);
        return;
      }
      Logger.debug(`Success updating rates for cart ${cartId}`, rates);
    });
  });
}
/*
 * Reaction Shipping Methods
 * methods typically used for checkout (shipping, taxes, etc)
 */
export const methods = {
  /**
   * shipping/updateShipmentQuotes
   * @summary gets shipping rates and updates the users cart methods
   * @todo add orderId argument/fallback
   * @param {String} cartId - cartId
   * @return {undefined}
   */
  "shipping/updateShipmentQuotes": function (cartId) {
    check(cartId, String);
    if (!cartId) {
      return [];
    }
    this.unblock();
    const cart = Cart.findOne(cartId);
    check(cart, CartSchema);

    if (cart) {
      const rates = Meteor.call("shipping/getShippingRates", cart);
      if (cart.shipping) {
        updateShippingRecordByShop(cart, rates);
      } else {
        createShippingRecordByShop(cart, rates);
      }
    }
  },

  /**
   * shipping/getShippingRates
   * @summary just gets rates, without updating anything
   * @param {Object} cart - cart object
   * @return {Array} return updated rates in cart
   */
  "shipping/getShippingRates": function (cart) {
    check(cart, CartSchema);
    const rates = [];
    const retrialTargets = [];
    // must have items to calculate shipping
    if (!cart.items) {
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

    let newRates;
    const didEveryShippingProviderFail = rates.every((shippingMethod) => {
      return shippingMethod.requestStatus && shippingMethod.requestStatus === "error";
    });
    if (didEveryShippingProviderFail) {
      newRates = [{
        requestStatus: "error",
        shippingProvider: "all",
        message: "All requests for shipping methods failed."
      }];
    } else {
      newRates = rates.filter((shippingMethod) => {
        return !(shippingMethod.requestStatus) || shippingMethod.requestStatus !== "error";
      });
    }

    Logger.debug("getShippingRates returning rates", rates);
    return newRates;
  }
};

Meteor.methods(methods);
