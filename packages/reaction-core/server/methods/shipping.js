
/**
* ReactionCore Shipping Methods
* methods typically used for checkout (shipping, taxes, etc)
*/

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Meteor.methods({

  /**
   * gets shipping rates and updates the users cart methods
   * TODO: add orderId argument/fallback
   */
  updateShipmentQuotes: function(cartId) {
    var cart, rates;
    if (!cartId) {
      return;
    }
    check(cartId, String);
    this.unblock();
    cart = ReactionCore.Collections.Cart.findOne(cartId);
    if (cart) {
      rates = Meteor.call("getShippingRates", cart);

      if(!rates) {
        return;
      }

      if (rates.length > 0) {
        ReactionCore.Collections.Cart.update({
          '_id': cartId
        }, {
          $set: {
            'shipping.shipmentQuotes': rates
          }
        });
      }
      ReactionCore.Log.debug(rates);
    }
  },

  /**
   *  just gets rates, without updating anything
   */
  getShippingRates: function(options) {
    var product, rates, selector, shipping, shops, _i, _len, _ref, _ref1, _ref2;
    check(options, Object);
    rates = [];
    selector = {
      shopId: ReactionCore.getShopId()
    };
    shops = [];
    _ref = options.items;


    if(!options.items) {
      return;
    }

    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      product = _ref[_i];
      if (_ref1 = product.shopId, __indexOf.call(shops, _ref1) < 0) {
        shops.push(product.shopId);
      }
    }
    if (_ref2 = ReactionCore.getShopId(), __indexOf.call(shops, _ref2) < 0) {
      shops.push(ReactionCore.getShopId());
    }
    if ((shops != null ? shops.length : void 0) > 0) {
      selector = {
        shopId: {
          $in: shops
        }
      };
    }
    shipping = ReactionCore.Collections.Shipping.find(selector);
    shipping.forEach(function(shipping) {
      var index, method, rate, _j, _len1, _ref3, _results;
      _ref3 = shipping.methods;
      _results = [];
      for (index = _j = 0, _len1 = _ref3.length; _j < _len1; index = ++_j) {
        method = _ref3[index];
        if (!(method.enabled === true)) {
          continue;
        }
        if (!method.rate) {
          method.rate = 0;
        }
        if (!method.handling) {
          method.handling = 0;
        }
        rate = method.rate + method.handling;
        _results.push(rates.push({
          carrier: shipping.provider.label,
          method: method,
          rate: rate,
          shopId: shipping.shopId
        }));
      }
      return _results;
    });
    ReactionCore.Log.info("getShippingrates returning rates");
    ReactionCore.Log.debug("rates", rates);
    return rates;
  }
});
