/**
 * Reaction Cart Methods
 */

Meteor.methods({
  /**
   * cart/mergeCart
   * merge matching sessionId cart into specified userId cart
   *
   * There should be one cart for each independent, non logged in user session
   * When a user logs in that cart now belongs to that user and we use the a single user cart.
   * If they are logged in on more than one devices, regardless of session, the user cart will be used
   * If they had more than one cart, on more than one device,logged in at seperate times then merge the carts
   */
  "cart/mergeCart": (cartId) => {
    check(cartId, String);

    var Cart = ReactionCore.Collections.Cart;
    var currentCart = Cart.findOne(cartId);
    var userId = currentCart.userId;
    var sessionId = ReactionCore.sessionId;
    var shopId = ReactionCore.getShopId();

    // no need to merge anonymous carts
    if (Roles.userIsInRole(userId, 'anonymous', shopId)) {
      return false;
    }

    // get session or user carts
    var sessionCarts = Cart.find({
      'session': sessionId,
      'userId': {
        $ne: userId
      }
    });

    ReactionCore.Log.info("merge cart: begin merge processing of session " + sessionId + " into: " + currentCart._id);

    let currentCartItems = currentCart.items;

    // loop through session carts and merge into user cart
    sessionCarts.forEach((sessionCart) => {
      ReactionCore.Log.info("merge cart: merge user userId:", userId, "sessionCart.userId:" + sessionCart.userId,"sessionCart id: "  + sessionCart._id);
      // really if we have no items, there's nothing to merge
      if (sessionCart.items) {
        // merge session cart into current cart
        Cart.update(currentCart._id, {
          $set: {
            userId: Meteor.userId()
          },
          $addToSet: {
            items: {
              $each: sessionCart.items
            }
          }
        });
      }
      // cleanup session Carts after merge.
      if (sessionCart.userId !== this.userId) {
        // clear the cart that was used for a session
        // and we're also going to do some garbage Collection
        Cart.remove(sessionCart._id);
        Meteor.users.remove(sessionCart.userId);
        ReactionCore.Collections.Accounts.remove({
          userId: sessionCart.userId
        });
        ReactionCore.Log.info("merge cart: delete cart " + sessionCart._id + "and user: " + sessionCart.userId);
      }

      ReactionCore.Log.info("merge cart: processed merge for cartId " + sessionCart._id);
      return currentCart._id;
    });

    return currentCart._id;
  },

  /**
   * cart/createCart
   * returns new cart for user
   */
  "cart/createCart": (createForUserId) => {
    check(createForUserId, Match.Optional(String));
    this.unblock();
    var sessionId;
    var userId = createForUserId || this.userId;
    var Cart = ReactionCore.Collections.Cart;
    var newCartId;

    // find current userCart
    // this is the only true cart
    var currentUserCart = Cart.findOne({
      'userId': userId
    });

    if (currentUserCart) {
      sessionId = currentUserCart.session;
    } else {
      sessionId = ReactionCore.sessionId;
    }

    // while anonymous and merge into user cart
    var sessionCartCount = Cart.find({
      'session': sessionId,
      'userId': {
        $ne: userId
      }
    }).count();

    // check if user has `anonymous` role.( this is a visitor)
    anonymousUser = ReactionCore.hasPermission('anonymous');
    // the cart is either current or new
    if (currentUserCart) {
      var currentCartId = currentUserCart._id;
    }

    ReactionCore.Log.debug("create cart: shopId", shopId);
    ReactionCore.Log.debug("create cart: userId", userId);
    ReactionCore.Log.debug("create cart: sessionId", sessionId);
    ReactionCore.Log.debug("create cart: currentUserCart", currentCartId);
    ReactionCore.Log.debug("create cart: sessionCarts.count", sessionCartCount);
    ReactionCore.Log.debug("create cart: anonymousUser", anonymousUser);

    // if we have a session cart, but just create or
    // authenticated into a new user we need to create a user
    // cart for the new authenticated user.
    if (!currentCartId && anonymousUser === false) {
      currentCartId = Cart.insert({
        sessionId: sessionId,
        userId: userId
      });
      ReactionCore.Log.info("create cart: into new user cart. created: " + currentCartId + " for user " + userId);
    }

    // merge session carts into the current cart
    if (currentCartId && sessionCartCount > 0 && anonymousUser === false) {
      ReactionCore.Log.info("create cart: found existing cart. merge into " + currentCartId + " for user " + userId);
      Meteor.call("cart/mergeCart", currentCartId);

    } else if (!currentCartId) { // Create empty cart if there is none.
      currentCartId = Cart.insert({
        sessionId: sessionId,
        shopId: shopId,
        userId: userId
      });
      ReactionCore.Log.info("create cart: no existing cart. created: " + currentCartId + " for " + userId);
    }
    return currentCartId;
  },
  /**
   *  cart/addToCart
   *  @summary add items to a user cart
   *  @params {String} cartId - cartId
   *  @params {String} productId - productId to add to Cart
   *  @params {String} variantData - variant object
   *  @params {String} quantity - qty to add to cart, deducts from inventory
   *
   * when we add an item to the cart, we want to break all relationships
   * with the existing item. We want to fix price, qty, etc into history
   * however, we could check reactively for price /qty etc, adjustments on
   * the original and notify them
   */
  "cart/addToCart": (cartId, productId, variantData, quantity) => {
    check(cartId, String);
    check(productId, String);
    check(variantData, ReactionCore.Schemas.ProductVariant);
    check(quantity, String);

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
          ReactionCore.Log.warn("error adding to cart", ReactionCore.Collections.Cart.simpleSchema().namedContext().invalidKeys());
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
          ReactionCore.Log.warn("error adding to cart", ReactionCore.Collections.Cart.simpleSchema().namedContext().invalidKeys());
          return;
        }
      });
    }
  },

  /*
   * removes a variant from the cart
   */
  "cart/removeFromCart": (cartId, variantData) => {
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
   * cart/copyCartToOrder - transforms cart to order
   * when a payment is processed we want to copy the cart
   * over to an order object, and give the user a new empty
   * cart. reusing the cart schema makes sense, but integrity of
   * the order, we don't want to just make another cart item
   *
   * TODO:  Partial order processing, shopId processing
   * TODO:  Review Security on this method
   */
  "cart/copyCartToOrder": (cartId) => {
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
    ReactionCore.Log.info("Created orderId", orderId);

    if (orderId) {
      // TODO: check for succesful orders/inventoryAdjust
      Meteor.call("orders/inventoryAdjust", orderId);

      // trash the old cart
      ReactionCore.Collections.Cart.remove({
        _id: order.cartId
      });

      // create a new cart for the user
      // even though this should be caught by
      // subscription handler, it's not always working
      var newCartExists = ReactionCore.Collections.Cart.find(order.userId);
      if (newCartExists.count() === 0) {
        Meteor.call("cart/createCart", order.userId);
      }
      // return
      ReactionCore.Log.info("Transitioned cart " + cartId + " to order " + orderId);
      return orderId;
    } else {
      throw new Meteor.Error("cart/copyCartToOrder: Invalid request");
    }
  },

  /**
   * cart/setShipmentMethod
   * saves method as order default
   */
  "cart/setShipmentMethod": (cartId, method) => {
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
      Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
    }
  },

  /**
   * cart/setShipmentAddress
   * adds addressBook entry to cart shipping
   */
  "cart/setShipmentAddress": (cartId, address) => {
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
      Meteor.call("shipping/updateShipmentQuotes", cartId);

      // it's ok for this to be called multiple times
      Meteor.call('workflow/pushCartWorkflow', "coreCartWorkflow", "coreCheckoutShipping");

      // this is probably a crappy way to do this.
      if (!cart.payment) {
        Meteor.call('cart/setPaymentAddress', cartId, address);
      }

    } else {
      throw new Meteor.Error("cart/setShipmentAddress: Invalid request");
    }
  },

  /**
   * cart/setPaymentAddress
   * adds addressBook entry to cart
   */
  "cart/setPaymentAddress": (cartId, address) => {
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
        Meteor.call('cart/setShipmentAddress', cartId, address);
      }

      return result;
    } else {
      throw new Meteor.Error("cart/setPaymentAddress: Invalid request");
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
