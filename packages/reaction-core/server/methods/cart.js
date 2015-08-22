/**
* Reaction Cart Methods
*/
// match helper
Match.OptionalOrNull = function(pattern) {
  return Match.OneOf(void 0, null, pattern);
};


/*
 *  getCurrentCart(sessionId)
 *  create, merge the session and user carts and return cart cursor
 *
 * There should be one cart for each independent, non logged in user session
 * When a user logs in that cart now belongs to that user and we use the a single user cart.
 * If they are logged in on more than one devices, regardless of session, the user cart will be used
 * If they had more than one cart, on more than one device,logged in at seperate times then merge the carts
 *
 */


/*
 *  Cart Methods
 */

Meteor.methods({

  /*
   * when we add an item to the cart, we want to break all relationships
   * with the existing item. We want to fix price, qty, etc into history
   * however, we could check reactively for price /qty etc, adjustments on
   * the original and notify them
   */
  addToCart: function(cartId, productId, variantData, quantity) {
    var cartVariantExists, currentCart, product, shopId;
    check(cartId, String);
    check(productId, String);
    check(variantData, ReactionCore.Schemas.ProductVariant);
    check(quantity, String);
    shopId = ReactionCore.getShopId(this);
    currentCart = Cart.findOne(cartId);
    cartVariantExists = Cart.findOne({
      _id: currentCart._id,
      "items.variants._id": variantData._id
    });
    if (cartVariantExists) {
      Cart.update({
        _id: currentCart._id,
        'items.variants._id': variantData._id
      }, {
        $set: {
          updatedAt: new Date()
        },
        $inc: {
          'items.$.quantity': quantity
        }
      });
      return function(error, result) {
        if (error) {
          ReactionCore.Events.warn("error adding to cart", Cart.simpleSchema().namedContext().invalidKeys());
          return error;
        }
      };
    } else {
      product = ReactionCore.Collections.Products.findOne(productId);
      return Cart.update({
        _id: currentCart._id
      }, {
        $addToSet: {
          items: {
            _id: Random.id(),
            shopId: product.shopId,
            productId: productId,
            quantity: quantity,
            variants: variantData
          }
        }
      }, function(error, result) {
        if (error) {
          ReactionCore.Events.warn("error adding to cart", Cart.simpleSchema().namedContext().invalidKeys());
          return;
        }
      });
    }
  },

  /*
   * removes a variant from the cart
   */
  removeFromCart: function(sessionId, cartId, variantData) {
    check(sessionId, String);
    check(cartId, String);
    check(variantData, Object);
    return Cart.update({
      _id: cartId,
      $or: [
        {
          userId: this.userId
        }, {
          sessionId: sessionId
        }
      ]
    }, {
      $pull: {
        "items": {
          "variants": variantData
        }
      }
    });
  },

  /*
   * adjust inventory when an order is placed
   */
  inventoryAdjust: function(orderId) {
    var order, product, _i, _len, _ref;
    check(orderId, String);
    order = Orders.findOne(orderId);
    if (!order) {
      return false;
    }
    _ref = order.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      product = _ref[_i];
      Products.update({
        _id: product.productId,
        "variants._id": product.variants._id
      }, {
        $inc: {
          "variants.$.inventoryQuantity": -product.quantity
        }
      });
    }
  },

  /**
   * copyCartToOrder - transforms cart to order
   * when a payment is processed we want to copy the cart
   * over to an order object, and give the user a new empty
   * cart. reusing the cart schema makes sense, but integrity of
   * the order, we don't want to just make another cart item
   *
   * TODO:  Partial order processing, shopId processing
   * TODO:  Review Security on this method
   */
  copyCartToOrder: function(cartId) {
    var cart, emails, error, invoice, now, orderId, user;
    check(cartId, String);
    cart = ReactionCore.Collections.Cart.findOne(cartId);
    invoice = {};
    invoice.shipping = cart.cartShipping();
    invoice.subtotal = cart.cartSubTotal();
    invoice.taxes = cart.cartTaxes();
    invoice.discounts = cart.cartDiscounts();
    invoice.total = cart.cartTotal();
    cart.payment.invoices = [invoice];
    if (cart.userId && !cart.email) {
      user = Meteor.user(cart.userId);
      emails = _.pluck(user.emails, "address");
      cart.email = emails[0];
    }
    now = new Date();
    cart.createdAt = now;
    cart.updatedAt = now;
    cart.status = "orderCreated";
    cart._id = Random.id();
    cart.cartId = cartId;

    /*
     * final sanity check
     * TODO add `check cart, ReactionCore.Schemas.Order`
     * and add some additional validation that all is good
     * and no tampering has occurred
     */
    try {
      orderId = Orders.insert(cart);
      if (orderId) {
        Cart.remove({
          _id: cartId
        });
        Meteor.call("inventoryAdjust", orderId);
        ReactionCore.Events.info("Completed cart for " + cartId);
      }
    } catch (_error) {
      error = _error;
      ReactionCore.Events.info("error in order insert");
      ReactionCore.Events.warn(error, Orders.simpleSchema().namedContext().invalidKeys());
      return error;
    }
    return orderId;
  },

  /**
   * setShipmentMethod
   * saves method as order default
   */
  setShipmentMethod: function(cartId, method) {
    var cart;
    check(cartId, String);
    check(method, Object);

    if (!(cartId && method)) {
      return;
    }

    cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });

    if (cart) {
        ReactionCore.Collections.Cart.update(cartId, {
          $set: { "shipping.shipmentMethod": method }
        });

        ReactionCore.Events.info("cart/setStatus coreCheckoutShipping", cartId);
        // this will transition to review
        if (cart.status == "coreCheckoutShipping") {
          Meteor.call('cart/setStatus', 'coreCheckoutReview');
        }
      }
  },

  /**
   * setShipmentAddress
   * adds addressBook entry to cart shipping
   */
  setShipmentAddress: function(cartId, address) {
    var cart;
    check(cartId, String);
    check(address, Object);
    if (!(cartId && address)) {
      return;
    }
    cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });
    if (cart) {
      Cart.update(cartId, {
        $set: {
          "shipping.address": address
        }
      });

      Meteor.call("updateShipmentQuotes", cartId);
      if (!cart.shipping.address.fullName) {
        ReactionCore.Events.info("cart/setStatus checkoutAddressBook", cartId);
        if (!cart.payment) {
          Meteor.call('setPaymentAddress', cartId, address);
        }
        return  Meteor.call('cart/setStatus', 'checkoutAddressBook');
      }
    } else {
      throw new Meteor.Error("setShipmentAddress: Invalid request");
    }
  },

  /**
   * setPaymentAddress
   * adds addressBook entry to cart
   */
  setPaymentAddress: function(cartId, address) {
    var cart;
    check(cartId, String);
    check(address, Object);
    if (!(cartId && address)) {
      return;
    }
    cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });
    if (cart) {
      result = Cart.update(cartId, {
        $set: {
          "payment.address": address
        }
      });
      if (!cart.shipping.address.fullName) {
        ReactionCore.Events.info("cart/setStatus checkoutAddressBook", cartId);
        Meteor.call('setShipmentAddress', cartId, address);
      }
      return result;
    } else {
      throw new Meteor.Error("setPaymentAddress: Invalid request");
    }
  },

  /**
   * mergeCart
   * merge matching sessionId cart into specified userId cart
   */
  mergeCart: function(cartId) {
    var Cart, currentCart, sessionCarts, sessionId, shopId, userId;
    check(cartId, String);
    this.unblock();
    Cart = ReactionCore.Collections.Cart;
    currentCart = Cart.findOne(cartId);
    userId = currentCart.userId;
    sessionId = ReactionCore.sessionId;
    shopId = ReactionCore.getShopId();
    if (Roles.userIsInRole(userId, 'anonymous', shopId)) {
      return;
    }
    sessionCarts = Cart.find({
      $or: [
        {
          'userId': userId
        }, {
          'sessions': {
            $in: [sessionId]
          }
        }
      ]
    });
    ReactionCore.Events.info("begin merge processing into: " + currentCart._id);
    sessionCarts.forEach(function(sessionCart) {
      if (userId !== sessionCart.userId && currentCart._id !== sessionCart._id) {
        if (!sessionCart.items) {
          sessionCart.items = [];
        }
        Cart.update(currentCart._id, {
          $addToSet: {
            items: {
              $each: sessionCart.items
            },
            sessions: {
              $each: sessionCart.sessions
            }
          }
        });
        Cart.remove(sessionCart._id);
        Meteor.users.remove(sessionCart.userId);
        ReactionCore.Collections.Accounts.remove({
          userId: sessionCart.userId
        });
        ReactionCore.Events.info("delete cart: " + sessionCart._id + "and user: " + sessionCart.userId);
        return ReactionCore.Events.info("processed merge for cartId: " + sessionCart._id);
      }
    });
    return true;
  },

  /**
   * createCart
   * returns new cart for user
   */
  createCart: function(userId) {
    var Cart, newCartId, sessionId, shopId;
    check(userId, String);
    this.unblock();
    Cart = ReactionCore.Collections.Cart;
    sessionId = ReactionCore.sessionId;
    shopId = ReactionCore.getShopId();
    newCartId = Cart.insert({
      sessions: [sessionId],
      shopId: shopId,
      userId: userId
    });
    ReactionCore.Events.info("created cart: " + newCartId + " for user: " + userId);
    return Cart.find(newCartId);
  },

  /**
   * "cart/setStatu"
   * updates cart status
   * first sets, second call to same
   * will go to next status.
   */
  'cart/setStatus': function(status, cartId, userId) {
    var Cart, currentCart, currentStatus, defaultWorkflow, found, shopWorkflows;
    check(status, String);
    check(userId, Match.Optional(String));
    check(cartId, Match.Optional(String));
    this.unblock();
    userId = userId || Meteor.userId();
    Cart = ReactionCore.Collections.Cart;
    currentCart = Cart.findOne({
      userId: userId
    });
    cartId = cartId || currentCart._id;
    currentStatus = currentCart.status;
    shopWorkflows = ReactionCore.Collections.Shops.findOne({
      defaultWorkflows: {
        $elemMatch: {
          provides: "simple"
        }
      }
    }, {
      fields: {
        defaultWorkflows: true
      }
    });
    defaultWorkflow = shopWorkflows.defaultWorkflows[0].workflow;
    if (status === currentStatus) {
      found = defaultWorkflow.indexOf(currentStatus);
      status = defaultWorkflow[found + 1];
    }
    Cart.update(cartId, {
      $set: {
        status: status
      }
    });
    return Cart.update(cartId, {
      $set: {
        status: status
      }
    });
  }
});
