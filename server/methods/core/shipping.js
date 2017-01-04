import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Cart, Shipping } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { Cart as CartSchema } from "/lib/collections/schemas";

/*
 * Reaction Shipping Methods
 * methods typically used for checkout (shipping, taxes, etc)
 */
Meteor.methods({
  /**
   * shipping/updateShipmentQuotes
   * @summary gets shipping rates and updates the users cart methods
   * @todo add orderId argument/fallback
   * @param {String} cartId - cartId
   * @return {undefined}
   */
  "shipping/updateShipmentQuotes": function (cartId) {
    if (!cartId) {
      return [];
    }
    check(cartId, String);
    this.unblock();
    const cart = Cart.findOne(cartId);
    if (cart) {
      const rates = Meteor.call("shipping/getShippingRates", cart);
      // no rates found
      if (!rates) {
        return [];
      }
      let selector;
      let update;
      // temp hack until we build out multiple shipment handlers
      // if we have an existing item update it, otherwise add to set.
      if (cart.shipping && rates.length > 0) {
        selector = {
          "_id": cartId,
          "shipping._id": cart.shipping[0]._id
        };
        update = {
          $set: {
            "shipping.$.shipmentQuotes": rates
          }
        };
      } else {
        selector = {
          _id: cartId
        };
        update = {
          $push: {
            shipping: {
              shipmentQuotes: rates
            }
          }
        };
      }
      // add quotes to the cart
      if (rates.length > 0) {
        Cart.update(selector, update, function (error) {
          if (error) {
            Logger.warn(`Error adding rates to cart ${cartId}`, error);
            return;
          }
          Logger.debug(`Success adding rates to cart ${cartId}`, rates);
        });
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
    const shops = [];
    const products = cart.items;
    // default selector is current shop
    let selector = {
      "shopId": Reaction.getShopId(),
      "provider.enabled": true
    };
    // must have products to calculate shipping
    if (!cart.items) {
      return [];
    }
    // create an array of shops, allowing
    // the cart to have products from multiple shops
    for (const product of products) {
      if (product.shopId) {
        shops.push(product.shopId);
      }
    }
    // if we have multiple shops in cart
    if ((shops !== null ? shops.length : void 0) > 0) {
      selector = {
        "shopId": {
          $in: shops
        },
        "provider.enabled": true
      };
    }

    const shippings = Shipping.find(selector);
    let shippoShippings = {};

    shippings.forEach(function (shipping) {
      const _results = [];
      // If provider is from Shippo, put it in an object to get rates dynamically for all of them after.
      if (shipping.provider.shippoProvider) {
        shippoShippings[shipping.provider.shippoProvider.carrierAccountId] = shipping;
      } else {
        for (const method of shipping.methods) {
          if (!method.enabled) {
            continue;
          }
          if (!method.rate) {
            method.rate = 0;
          }
          if (!method.handling) {
            method.handling = 0;
          }
          // Store shipping provider here in order to have it available in shipmentMethod
          // for cart and order usage
          if (!method.carrier) {
            method.carrier = shipping.provider.label;
          }
          const rate = method.rate + method.handling;
          _results.push(rates.push({
            carrier: shipping.provider.label,
            method: method,
            rate: rate,
            shopId: shipping.shopId
          }));
        }
        return _results;
      }
    });
    //  Get shippingRates from Shippo
    if (!_.isEmpty(shippoShippings)) {
      const shippoRates = Meteor.call("shippo/getShippingRatesForCart", cart._id, shippoShippings);
      rates.push(...shippoRates);
    }
    Logger.debug("getShippingRates returning rates", rates);
    return rates;
  }
});
