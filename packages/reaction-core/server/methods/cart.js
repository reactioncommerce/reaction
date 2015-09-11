/**
 * Reaction Cart Methods
 */

Meteor.methods({
  /**
   * mergeCart
   * merge matching sessionId cart into specified userId cart
   *
   * There should be one cart for each independent, non logged in user session
   * When a user logs in that cart now belongs to that user and we use the a single user cart.
   * If they are logged in on more than one devices, regardless of session, the user cart will be used
   * If they had more than one cart, on more than one device,logged in at seperate times then merge the carts
   */
  mergeCart: function (cartId) {
    check(cartId, String);

    var Cart, currentCart, sessionCarts, sessionId, shopId, userId;
    Cart = ReactionCore.Collections.Cart;
    currentCart = Cart.findOne(cartId);
    userId = currentCart.userId;
    sessionId = ReactionCore.sessionId;
    shopId = ReactionCore.getShopId();

    // no need to merge anonymous carts
    if (Roles.userIsInRole(userId, 'anonymous', shopId)) {
      return false;
    }

    // get session or user carts
    sessionCarts = Cart.find({
      $or: [{
        'userId': userId
      }, {
        'sessions': {
          $in: [sessionId]
        }
      }]
    });

    ReactionCore.Events.info("begin merge processing into: " + currentCart._id);
    // loop through session carts and merge into user cart
    sessionCarts.forEach(function (sessionCart) {
      ReactionCore.Events.info("merge info: ", userId, sessionCart.userId, currentCart._id, sessionCart._id);

      if (userId == sessionCart.userId || currentCart._id == sessionCart._id) {

        Cart.update(sessionCart._id, {
          $set: {
            userId: Meteor.userId()
          },
          $addToSet: {
            items: {
              $each: currentCart.items
            },
            sessions: {
              $each: currentCart.sessions
            }
          }
        });

        // delete the session Cart after merge.
        Cart.remove(currentCart._id);
        Meteor.users.remove(currentCart.userId);
        ReactionCore.Collections.Accounts.remove({
          userId: currentCart.userId
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
  createCart: function (createForUserId) {
    check(createForUserId, Match.OneOf(String, null));
    this.unblock();

    var user = Meteor.user();
    var userId = createForUserId || user._id;
    var shopId = ReactionCore.getShopId();
    var sessionId = ReactionCore.sessionId;
    var Cart = ReactionCore.Collections.Cart;
    var newCartId;

    // required
    check(sessionId, String);
    check(userId, String);

    // find current userCart
    // this is the only true cart
    var currentUserCart = Cart.findOne({
      'userId': userId
    });

    // find carts this user might have had
    // while anonymous and merge into user cart
    var sessionCarts = Cart.find({
      'sessions': {
        $in: [sessionId]
      },
      'userId': {
        $ne: userId
      }
    });

    // if no session cart or currentCart then create a new cart
    if (!currentUserCart) {
      newCartId = Cart.insert({
        sessions: [sessionId],
        shopId: shopId,
        userId: userId
      });
      ReactionCore.Events.info("no existing cart. created: " + newCartId + " for " + userId);
    }
    // the cart is either current or new
    if (currentUserCart) {
      currentCartId = currentUserCart._id;
    } else {
      currentCartId = newCartId;
    }

    // check if use is anonymous
    anonymousUser = ReactionCore.hasPermission('anonymous');

    // if there are session carts, we're merge them
    // there should only be one cart - the currentUserCart
    if (currentCartId && sessionCarts.count() !== 0 && !anonymousUser) {

      sessionCarts.forEach(function (sessionCart) {
        var staleCartId = sessionCart._id;
        var staleCartUserId = sessionCart.userId;
        // merge items if they exist
        if (sessionCart.items) {
          // update the current userCart
          Cart.update(currentCartId, {
            $set: {
              'userId': userId
            },
            $addToSet: {
              'items': {
                $each: sessionCart.items
              }
            }
          });
        }
        // the 'anonymous' session carts are now longer needed.
        // instead of deleting, defer cleanup
        // mark accounts "expired"
        /*ReactionCore.Events.info("Remove stale cart", staleCartId);*/
        ReactionCore.Collections.Accounts.update({
          'userId': staleCartUserId,
          $set: {
            state: "expired"
          }
        });
        // remove the cart user and session
        Cart.remove(staleCartId);

        ReactionCore.Events.info("processed: " + staleCartId + "for user: " + sessionCart.userId + " into " + currentCartId);

      });
    }
  },
  /**
   *  @summary addToCart
   *  @params cartId
   *  @params productId
   *
   * when we add an item to the cart, we want to break all relationships
   * with the existing item. We want to fix price, qty, etc into history
   * however, we could check reactively for price /qty etc, adjustments on
   * the original and notify them
   */
  addToCart: function (cartId, productId, variantData, quantity) {
    check(cartId, String);
    check(productId, String);
    check(variantData, ReactionCore.Schemas.ProductVariant);
    check(quantity, String);
    this.unblock();

    var shopId = ReactionCore.getShopId(this);
    var currentCart = ReactionCore.Collections.Cart.findOne(cartId);
    var cartVariantExists = ReactionCore.Collections.Cart.findOne({
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
      return function (error, result) {
        if (error) {
          ReactionCore.Events.warn("error adding to cart", ReactionCore.Collections.Cart.simpleSchema().namedContext().invalidKeys());
          return error;
        }
      };

    } else {
      var product = ReactionCore.Collections.Products.findOne(productId);
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
      }, function (error, result) {
        if (error) {
          ReactionCore.Events.warn("error adding to cart", ReactionCore.Collections.Cart.simpleSchema().namedContext().invalidKeys());
          return;
        }
      });
    }
  },

  /*
   * removes a variant from the cart
   */
  removeFromCart: function (cartId, variantData) {
    check(cartId, String);
    check(variantData, Object);
    this.unblock();

    return Cart.update({
      _id: cartId,
    }, {
      $pull: {
        "items": {
          "variants": variantData
        }
      }
    });
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
  copyCartToOrder: function (cartId) {
    check(cartId, String);

    var error;
    var now = new Date();
    var cart = ReactionCore.Collections.Cart.findOne(cartId);
    var order = _.clone(cart);

    // reassign the id, we'll get a new orderId
    order.cartId = cart._id;

    // a helper for guest login, we let guest add email afterwords
    // for ease, we'll also add automatically for logged in users
    if (order.userId && !order.email) {
      var user = Meteor.user(order.userId);
      var emails = _.pluck(user.emails, "address");
      order.email = emails[0];
    }

    // schema should provide order defaults
    // so we'll delete the cart autovalues
    delete order.createdAt; // autovalues
    delete order.updatedAt;
    delete order.cartCount;
    delete order.cartShipping;
    delete order.cartSubTotal;
    delete order.cartTaxes;
    delete order.cartDiscounts;
    delete order.cartTotal;
    delete order._id;

    // init item level workflow
    _.each(order.items, function (item, index) {
      order.items[index].workflow = {
        'status': "orderCreated",
        'workflow': ["inventoryAdjusted"]
      };
    });

    if (!order.items) {
      throw new Meteor.Error("An error occurred saving the order. Missing cart items.");
    }

    // set new workflow status
    order.workflow.status = "new";
    order.workflow.workflow = ["orderCreated"];

    // insert new reaction order
    var orderId = ReactionCore.Collections.Orders.insert(order);
    ReactionCore.Events.info("Created orderId", orderId);

    if (orderId) {
      // TODO: check for succesful inventoryAdjust
      Meteor.call("inventoryAdjust", orderId);

      // trash the old cart
      ReactionCore.Collections.Cart.remove({
        _id: order.cartId
      });

      // create a new cart for the user
      // even though this should be caught by
      // subscription handler, it's not always working
      var newCartExists = ReactionCore.Collections.Cart.find(order.userId);
      if (newCartExists.count() === 0) {
        Meteor.call("createCart", order.userId);
      }
      // return
      ReactionCore.Events.info("Transitioned cart " + cartId + " to order " + orderId);
      return orderId;
    } else {
      throw new Meteor.Error("copyCartToOrder: Invalid request");
    }
  },

  /**
   * setShipmentMethod
   * saves method as order default
   */
  setShipmentMethod: function (cartId, method) {
    check(cartId, String);
    check(method, Object);

    if (!(cartId && method)) {
      return;
    }
    // get current cart
    var cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });

    if (cart) {
      ReactionCore.Collections.Cart.update(cartId, {
        $set: {
          "shipping.shipmentMethod": method
        }
      });
      // this will transition to review
      Meteor.call("layout/pushWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    }
  },

  /**
   * setShipmentAddress
   * adds addressBook entry to cart shipping
   */
  setShipmentAddress: function (cartId, address) {
    check(cartId, String);
    check(address, Object);
    this.unblock();

    if (!(cartId && address)) {
      return;
    }
    var cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });

    if (cart) {
      Cart.update(cartId, {
        $set: {
          "shipping.address": address
        }
      });

      // refresh shipping quotes
      Meteor.call("updateShipmentQuotes", cartId);

      // it's ok for this to be called multiple times
      Meteor.call('layout/pushWorkflow', "coreCartWorkflow", "coreCheckoutShipping");

      // this is probably a crappy way to do this.
      if (!cart.payment) {
        Meteor.call('setPaymentAddress', cartId, address);
      }

    } else {
      throw new Meteor.Error("setShipmentAddress: Invalid request");
    }
  },

  /**
   * setPaymentAddress
   * adds addressBook entry to cart
   */
  setPaymentAddress: function (cartId, address) {
    check(cartId, String);
    check(address, Object);
    this.unblock();

    if (!(cartId && address)) {
      return;
    }

    var cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });

    if (cart) {
      result = Cart.update(cartId, {
        $set: {
          "payment.address": address
        }
      });

      // set as default shipping if not set
      if (!cart.shipping) {
        Meteor.call('setShipmentAddress', cartId, address);
      }

      return result;
    } else {
      throw new Meteor.Error("setPaymentAddress: Invalid request");
    }
  },

  /**
   * cart/submitPayment
   * saves a submitted payment
   * adds "paymentSubmitted" to cart workflow
   */

  "cart/submitPayment": function (paymentMethod) {
    check(paymentMethod, Object);

    var checkoutCart = ReactionCore.Collections.Cart.findOne({
      'userId': Meteor.userId()
    });

    var cart = _.clone(checkoutCart);
    var cartId = cart._id;
    var invoice = {
      shipping: cart.cartShipping(),
      subtotal: cart.cartSubTotal(),
      taxes: cart.cartTaxes(),
      discounts: cart.cartDiscounts(),
      total: cart.cartTotal()
    };

    // we won't actually close the order at this stage.
    // we'll just update the workflow where
    // method-hooks can process the workflow update.

    result = ReactionCore.Collections.Cart.update({
      _id: cartId
    }, {
      $addToSet: {
        "payment.paymentMethod": paymentMethod,
        "payment.invoices": invoice,
        "workflow.workflow": "paymentSubmitted"
      }
    });

    var updatedCart = ReactionCore.Collections.Cart.findOne({
      'userId': Meteor.userId()
    });

    // Client Stub Actions
    if (result === 1 && updatedCart.payment && updatedCart.items) {
      return cartId;
    } else {
      Alerts.add("Failed to place order.", "danger", {
        autoHide: true,
        placement: "paymentMethod"
      });
      throw new Meteor.Error("An error occurred saving the order", cartId, error);
    }
  }
});
