import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Cart } from "/lib/collections";
import { Logger, Hooks } from "/server/api";
import { Cart as CartSchema } from "/lib/collections/schemas";

function createShippingRecordByShop(cart, rates) {
  const cartId = cart._id;
  const itemsByShop = cart.getItemsByShop();
  const shops = Object.keys(itemsByShop);
  const selector = { _id: cartId };
  shops.map((shopId) => {
    const update = {
      $push: {
        shipping: {
          shipmentQuotes: rates,
          shopId: shopId
        }
      }
    };
    return Cart.update(selector, update, (error) => {
      if (error) {
        Logger.error(`Error adding rates to cart from createShippingRecordByShop ${cartId}`, error);
        return;
      }
      Logger.debug(`Success adding rates to cart ${cartId}`, rates);
    });
  });
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
      update = {
        $set: {
          "shipping.$.shipmentQuotes": rates
        }
      };
    } else {
      selector = { _id: cartId };
      update = {
        $push: {
          shipping: {
            shipmentQuotes: rates,
            shopId: shopId
          }
        }
      };
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
    // must have items to calculate shipping
    if (!cart.items) {
      return rates;
    }
    // hooks for other shipping rate events
    // all callbacks should return rates
    Hooks.Events.run("onGetShippingRates", rates, cart);
    Logger.debug("getShippingRates returning rates", rates);
    return rates;
  }
};

Meteor.methods(methods);
