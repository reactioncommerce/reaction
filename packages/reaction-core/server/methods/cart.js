/**
 * quantityProcessing
 * @summary perform calculations admissibility of adding product to cart
 * @param {Object} product - product to add to Cart
 * @param {Object} variant - product variant
 * @param {Number} itemQty - qty to add to cart, defaults to 1, deducts
 *  from inventory
 * @since 1.10.1
 * @return {Number} quantity - revised quantity to be added to cart
 */
function quantityProcessing(product, variant, itemQty = 1) {
  // todo add min item threshold to schema
  let quantity = itemQty;
  const MIN = variant.min || 1;
  const MAX = variant.inventoryQuantity || Infinity;

  if (MIN > MAX) {
    ReactionCore.Log.info(`productId: ${product._id}, variantId ${variant._id
      }: inventoryQuantity lower then minimum order`);
    throw new Meteor.Error(`productId: ${product._id}, variantId ${variant._id
      }: inventoryQuantity lower then minimum order`);
  }

  switch (product.type) {
  case "not-in-stock":
    break;
  default: // type: `simple`
    if (quantity < MIN) {
      quantity = MIN;
    } else if (quantity > MAX) {
      quantity = MAX;
    }
  }

  return quantity;
}

/**
 * Reaction Cart Methods
 */

Meteor.methods({
  /**
   * cart/mergeCart
   * @summary merge matching sessionId cart into specified userId cart
   *
   * There should be one cart for each independent, non logged in user session
   * When a user logs in that cart now belongs to that user and we use the a
   * single user cart.
   * If they are logged in on more than one devices, regardless of session,the
   * user cart will be used
   * If they had more than one cart, on more than one device,logged in at
   * separate times then merge the carts
   *
   * @param {String} cartId - cartId of the cart to merge matching session
   * carts into.
   * @return {Object} cartId - cartId on success
   */
  "cart/mergeCart": function (cartId) {
    check(cartId, String);

    const { Cart } = ReactionCore.Collections; // convenience shorthand
    const { Log } = ReactionCore;
    // we don't process current cart, but merge into it.
    const currentCart = Cart.findOne(cartId);
    // just used to filter out the current cart
    const userId = currentCart.userId;
    // user should have an access to operate with only one - his - cart
    if (userId !== this.userId) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // persistent sessions, see: publications/sessions.js
    const sessionId = ReactionCore.sessionId;
    const shopId = ReactionCore.getShopId();

    // no need to merge anonymous carts
    if (Roles.userIsInRole(userId, "anonymous", shopId)) {
      return false;
    }
    Log.debug("merge cart: matching sessionId");
    Log.debug("current userId:", userId);
    Log.debug("sessionId:", sessionId);
    // get session carts without current user cart
    let sessionCarts = Cart.find({
      $and: [{
        userId: {
          $ne: userId
        }
      }, {
        sessionId: {
          $eq: sessionId
        }
      }]
    });

    Log.debug(
      `merge cart: begin merge processing of session ${
      sessionId} into: ${currentCart._id}`
    );
    // loop through session carts and merge into user cart
    sessionCarts.forEach(sessionCart => {
      // cart should belong to the anonymous
      if (!Roles.userIsInRole(sessionCart.userId, "anonymous", shopId)) {
        return;
      }

      Log.debug(
        `merge cart: merge user userId: ${userId}, sessionCart.userId: ${
          sessionCart.userId}, sessionCart id: ${sessionCart._id}`
      );
      // really if we have no items, there's nothing to merge
      if (sessionCart.items) {
        // if currentCart already have a cartWorkflow, we don't need to clean it
        // up completely, just to `coreCheckoutShipping` stage. Also, we will
        // need to recalculate shipping rates
        if (typeof currentCart.workflow === "object" &&
        typeof currentCart.workflow.workflow === "object") {
          if (currentCart.workflow.workflow.length > 3) {
            // todo uncomment
            // Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
            // refresh shipping quotes
            // todo uncomment
            // Meteor.call("shipping/updateShipmentQuotes", cartId);
          }
        } else {
          // if user logged in he doesn't need to show `checkoutLogin` step
          // todo uncomment
          // Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook");
        }

        // We got an additional db call because of `workflow/revertCartWorkflow`
        // call, but we also got things more cleaner in my opinion.
        // merge session cart into current cart
        Cart.update(currentCart._id, {
          $addToSet: {
            items: {
              $each: sessionCart.items
            }
          }
        });
      }
      // cleanup session Carts after merge.
      if (sessionCart.userId !== userId) {
        // clear the cart that was used for a session
        // and we're also going to do some garbage Collection
        Cart.remove(sessionCart._id);
        // cleanup user/accounts
        ReactionCore.Collections.Accounts.remove({
          userId: sessionCart.userId
        });
        Meteor.users.remove(sessionCart.userId);
        Log.debug(
          `merge cart: delete cart ${
          sessionCart._id} and user: ${sessionCart.userId}`
        );
      }
      Log.debug(
        `merge cart: processed merge for cartId ${sessionCart._id}`
      );
    });

    return currentCart._id;
  },

  /**
   * cart/createCart
   * @summary create and return new cart for user
   * @param {String} createForUserId - userId to create cart for
   * @returns {String} cartId - users cartId
   */
  "cart/createCart": function (createForUserId) {
    check(createForUserId, Match.Optional(String));
    this.unblock();

    let sessionId;
    const { Log } = ReactionCore;
    const userId = createForUserId || this.userId;
    const shopId = ReactionCore.getShopId();
    let currentCartId;

    // find current userCart
    // this is the only true cart
    const currentUserCart = ReactionCore.Collections.Cart.findOne({
      userId: userId
    });

    if (currentUserCart) {
      Log.debug("currentUserCart", currentUserCart.sessionId);
      sessionId = currentUserCart.session;
      // the cart is either current or new
      currentCartId = currentUserCart._id;
    } else {
      sessionId = ReactionCore.sessionId;
    }
    Log.debug("current cart serverSession", sessionId);
    // while anonymous and merge into user cart
    const sessionCartCount = ReactionCore.Collections.Cart.find({
      sessionId: sessionId,
      userId: {
        $ne: userId
      }
    }).count();

    // check if user has `anonymous` role.( this is a visitor)
    const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);

    Log.info("create cart: shopId", shopId);
    Log.debug("create cart: userId", userId);
    Log.debug("create cart: sessionId", sessionId);
    Log.debug("create cart: currentUserCart", currentCartId);
    Log.debug("create cart: sessionCarts.count", sessionCartCount);
    Log.debug("create cart: anonymousUser", anonymousUser);

    // if we have a session cart, but just create or
    // authenticated into a new user we need to create a user
    // cart for the new authenticated user.
    if (!currentCartId && anonymousUser === false) {
      currentCartId = ReactionCore.Collections.Cart.insert({
        sessionId: sessionId,
        userId: userId
      });
      Log.debug("create cart: into new user cart. created: " +  currentCartId +
        " for user " + userId);
    }

    // merge session carts into the current cart
    if (currentCartId && sessionCartCount > 0 && anonymousUser === false) {
      Log.debug("create cart: found existing cart. merge into " + currentCartId
        + " for user " + userId);
      Meteor.call("cart/mergeCart", currentCartId);
    } else if (!currentCartId) { // Create empty cart if there is none.
      currentCartId = ReactionCore.Collections.Cart.insert({
        sessionId: sessionId,
        userId: userId
      });
      Log.debug(`create cart: no existing cart. created: ${currentCartId
        } currentCartId for sessionId ${sessionId} and userId ${userId}`);
    }
    return currentCartId;
  },

  /**
   *  cart/addToCart
   *  @summary add items to a user cart
   *  when we add an item to the cart, we want to break all relationships
   *  with the existing item. We want to fix price, qty, etc into history
   *  however, we could check reactively for price /qty etc, adjustments on
   *  the original and notify them
   *  @param {String} productId - productId to add to Cart
   *  @param {String} variantId - product variant _id
   *  @param {Number} [itemQty] - qty to add to cart
   *  @return {Number|Object} Mongo insert response
   */
  "cart/addToCart": function (productId, variantId, itemQty) {
    // todo currently this throw and error. Maybe in Meteor 1.3 it will be fine
    //new SimpleSchema({
    //  productId: { type: String },
    //  variantId: { type: String },
    //  itemQty: { type: Number, decimal: true, optional: true }
    //}).validate({ productId, variantId, itemQty });
    check(productId, String);
    check(variantId, String);
    check(itemQty, Match.Optional(Number));
    this.unblock();

    const { Log } = ReactionCore;
    const cart = ReactionCore.Collections.Cart.findOne({ userId: this.userId });
    if (!cart) {
      Log.warn(`Cart is not defined for user: ${ this.userId }`);
      throw new Meteor.Error("not found", "Cart is not defined!");
    }
    const product = ReactionCore.Collections.Products.findOne(productId);
    if (!product) {
      Log.warn(`Product: ${ productId } was not found in database`);
      throw new Meteor.Error("not found", "Product is not defined!");
    }
    const variant = product.variants.find(function (currentVariant) {
      if (currentVariant._id === variantId) {
        return currentVariant;
      }
    });
    // performs calculations admissibility of adding product to cart
    const quantity = quantityProcessing(product, variant, itemQty);
    // performs search of variant inside cart
    const cartVariantExists = cart.items && cart.items
      .some(item => item.variants._id === variantId);

    if (cartVariantExists) {
      return ReactionCore.Collections.Cart.update({
        "_id": cart._id,
        "items.variants._id": variantId
      }, {
        $inc: {
          "items.$.quantity": quantity
        }
      }, function (error, result) {
        if (error) {
          Log.warn("error adding to cart", ReactionCore.Collections
            .Cart.simpleSchema().namedContext().invalidKeys());
          return error;
        }

        // refresh shipping quotes
        Meteor.call("shipping/updateShipmentQuotes", cart._id);

        Log.info(`cart: increment variant ${variantId} quantity by ${
          quantity}`);

        return result;
      });
    }

    // cart variant doesn't exist
    return ReactionCore.Collections.Cart.update({
      _id: cart._id
    }, {
      $addToSet: {
        items: {
          _id: Random.id(),
          shopId: product.shopId,
          productId: productId,
          quantity: quantity,
          variants: variant,
          type: product.type
        }
      }
    }, function (error, result) {
      if (error) {
        Log.warn("error adding to cart", ReactionCore.Collections.Cart
          .simpleSchema().namedContext().invalidKeys());
        return error;
      }

      // refresh shipping quotes
      Meteor.call("shipping/updateShipmentQuotes", cart._id);

      Log.info(`cart: add variant ${variantId} to cartId ${cart._id}`);

      return result;
    });
  },

  /**
   * cart/copyCartToOrder
   * @summary transform cart to order
   * when a payment is processed we want to copy the cart
   * over to an order object, and give the user a new empty
   * cart. reusing the cart schema makes sense, but integrity of
   * the order, we don't want to just make another cart item
   * @todo:  Partial order processing, shopId processing
   * @todo:  Review Security on this method
   * @param {String} cartId - cartId to transform to order
   * @return {String} returns orderId
   */
  "cart/copyCartToOrder": (cartId) => {
    check(cartId, String);
    let cart = ReactionCore.Collections.Cart.findOne(cartId);
    let order = _.clone(cart);
    let user;
    ReactionCore.Log.info("cart/copyCartToOrder", cartId);
    // reassign the id, we'll get a new orderId
    order.cartId = cart._id;

    // a helper for guest login, we let guest add email afterwords
    // for ease, we'll also add automatically for logged in users
    if (order.userId && !order.email) {
      user = ReactionCore.Collections.Accounts.findOne(order.userId);
      for (let email of user.emails) {
        // alternate order email address
        if (email.provides === "orders") {
          order.email = email.address;
        } else if (email.provides === "default") {
          order.email = email.address;
        }
      }
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

    if (!order.shipping) {
      order.shipping = [];
    }

    if (order.shipping) {
      if (order.shipping.length > 0) {
        order.shipping[0].paymentId = order.billing[0]._id;

        if (_.isArray(order.shipping[0].items) === false) {
          order.shipping[0].items = [];
        }
      }
    }

    // init item level workflow
    _.each(order.items, function (item, index) {
      order.items[index].workflow = {
        status: "orderCreated",
        workflow: ["inventoryAdjusted"]
      };


      if (order.shipping[0].items) {
        order.shipping[0].items.push({
          _id: item._id,
          productId: item.productId,
          shopId: item.shopId,
          variantId: item.variants._id,
          quantity: item.quantity
        });
      }
    });

    if (!order.items) {
      throw new Meteor.Error(
        "An error occurred saving the order. Missing cart items.");
    }

    // set new workflow status
    order.workflow.status = "new";
    order.workflow.workflow = ["orderCreated"];

    // insert new reaction order
    let orderId = ReactionCore.Collections.Orders.insert(order);
    ReactionCore.Log.info("Created orderId", orderId);

    if (orderId) {
      // TODO: check for succesful orders/inventoryAdjust
      // Meteor.call("orders/inventoryAdjust", orderId);
      // trash the old cart
      ReactionCore.Collections.Cart.remove({
        _id: order.cartId
      });
      // create a new cart for the user
      // even though this should be caught by
      // subscription handler, it's not always working
      let newCartExists = ReactionCore.Collections.Cart.find(order.userId);
      if (newCartExists.count() === 0) {
        Meteor.call("cart/createCart", order.userId);
      }
      // return
      ReactionCore.Log.info("Transitioned cart " + cartId + " to order " +
        orderId);
      Meteor.call("orders/sendNotification", ReactionCore.Collections.Orders.findOne(orderId));
      return orderId;
    }
    // we should not have made it here, throw error
    throw new Meteor.Error("cart/copyCartToOrder: Invalid request");
  },

  /**
   * cart/setShipmentMethod
   * @summary saves method as order default
   * @param {String} cartId - cartId to apply shipmentMethod
   * @param {Object} method - shipmentMethod object
   * @return {String} return Mongo update result
   */
  "cart/setShipmentMethod": function (cartId, method) {
    check(cartId, String);
    check(method, Object);
    // get current cart
    let cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });
    // a cart is required!
    if (!cart) {
      return;
    }

    // temp hack until we build out multiple shipping handlers
    let selector;
    let update;
    // temp hack until we build out multiple shipment handlers
    // if we have an existing item update it, otherwise add to set.
    if (cart.shipping) {
      selector = {
        "_id": cartId,
        "shipping._id": cart.shipping[0]._id
      };
      update = {
        $set: {
          "shipping.$.shipmentMethod": method
        }
      };
    } else {
      selector = {
        _id: cartId
      };
      update = {
        $addToSet: {
          shipping: {
            shipmentMethod: method
          }
        }
      };
    }
    // update or insert method
    ReactionCore.Collections.Cart.update(selector, update, function (
      error) {
      if (error) {
        ReactionCore.Log.warn(`Error adding rates to cart ${cartId}`,
          error);
        return;
      }
      // this will transition to review
      Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow",
        "coreCheckoutShipping");
      return;
    });
  },

  /**
   * cart/setShipmentAddress
   * @summary adds address book to cart shipping
   * @param {String} cartId - cartId to apply shipmentMethod
   * @param {Object} address - addressBook object
   * @return {String} return Mongo update result
   */
  "cart/setShipmentAddress": function (cartId, address) {
    check(cartId, String);
    check(address, ReactionCore.Schemas.Address);
    this.unblock();

    let cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });

    if (cart) {
      let selector;
      let update;
      // temp hack until we build out multiple shipment handlers
      // if we have an existing item update it, otherwise add to set.
      if (cart.shipping) {
        selector = {
          "_id": cartId,
          "shipping._id": cart.shipping[0]._id
        };
        update = {
          $set: {
            "shipping.$.address": address
          }
        };
      } else {
        selector = {
          _id: cartId
        };
        update = {
          $addToSet: {
            shipping: {
              address: address
            }
          }
        };
      }

      // add / or set the shipping address
      ReactionCore.Collections.Cart.update(selector, update, function (
        error) {
        if (error) {
          ReactionCore.Log.warn(error);
          return;
        }
        // refresh shipping quotes
        Meteor.call("shipping/updateShipmentQuotes", cartId);

        // it's ok for this to be called multiple times
        Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow",
          "coreCheckoutShipping");

        // this is probably a crappy way to do this
        // let's default the payment address
        if (!cart.billing) {
          Meteor.call("cart/setPaymentAddress", cartId, address);
        }
        return;
      });
    }
  },
  /**
   * cart/setPaymentAddress
   * @summary adds addressbook to cart payments
   * @param {String} cartId - cartId to apply payment address
   * @param {Object} address - addressBook object
   * @return {String} return Mongo update result
   */
  "cart/setPaymentAddress": function (cartId, address) {
    check(cartId, String);
    check(address, ReactionCore.Schemas.Address);
    this.unblock();

    let cart = ReactionCore.Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });

    if (cart) {
      let selector;
      let update;
      // temp hack until we build out multiple billing handlers
      // if we have an existing item update it, otherwise add to set.
      if (cart.billing) {
        selector = {
          "_id": cartId,
          "billing._id": cart.billing[0]._id
        };
        update = {
          $set: {
            "billing.$.address": address
          }
        };
      } else {
        selector = {
          _id: cartId
        };
        update = {
          $addToSet: {
            billing: {
              address: address
            }
          }
        };
      }

      ReactionCore.Collections.Cart.update(selector, update,
        function (error, result) {
          if (error) {
            ReactionCore.Log.warn(error);
          } else {
            // post payment address Methods
            return result;
          }
        });
    }
  },
  /**
   * cart/unsetAddresses
   * @description removes address from cart. This used then user remove address,
   * which was used in cart. This method not called directly from client side.
   * @param {String} addressId - address._id
   * @param {String} userId - cart owner _id
   * @return {Number|Object} The number of removed documents or error object
   */
  "cart/unsetAddresses": function (addressId, userId) {
    check(addressId, String);
    check(userId, String);
    this.unblock();

    const cart = ReactionCore.Collections.Cart.findOne({
      userId: userId
    });
    const selector = {
      _id: cart._id
    };
    let update = { $unset: {}};
    // we assume that the billing/shipping arrays can hold only one element [0]
    if (typeof cart.billing[0].address === "object" &&
      cart.billing[0].address._id === addressId) {
      update.$unset["billing.0.address"] = "";
    }
    if (typeof cart.shipping[0].address._id === "object" &&
      cart.shipping[0].address._id === addressId) {
      update.$unset["shipping.0.address"] = "";
    }
    return ReactionCore.Collections.Cart.update(selector, update);
  },
  /**
   * cart/submitPayment
   * @summary saves a submitted payment to cart, triggers workflow
   * and adds "paymentSubmitted" to cart workflow
   * Note: this method also has a client stub, that forwards to cartCompleted
   * @param {Object} paymentMethod - paymentMethod object
   * @return {String} returns update result
   */
  "cart/submitPayment": function (paymentMethod) {
    check(paymentMethod, ReactionCore.Schemas.PaymentMethod);

    let checkoutCart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    let cart = _.clone(checkoutCart);
    let cartId = cart._id;
    let invoice = {
      shipping: cart.cartShipping(),
      subtotal: cart.cartSubTotal(),
      taxes: cart.cartTaxes(),
      discounts: cart.cartDiscounts(),
      total: cart.cartTotal()
    };

    // we won't actually close the order at this stage.
    // we'll just update the workflow and billing data where
    // method-hooks can process the workflow update.

    let selector;
    let update;
    // temp hack until we build out multiple billing handlers
    // if we have an existing item update it, otherwise add to set.
    if (cart.billing) {
      selector = {
        "_id": cartId,
        "billing._id": cart.billing[0]._id
      };
      update = {
        $set: {
          "billing.$.paymentMethod": paymentMethod,
          "billing.$.invoice": invoice
        }
      };
    } else {
      selector = {
        _id: cartId
      };
      update = {
        $addToSet: {
          "billing.paymentMethod": paymentMethod,
          "billing.invoice": invoice
        }
      };
    }

    return ReactionCore.Collections.Cart.update(selector, update,
      function (error, result) {
        if (error) {
          ReactionCore.Log.warn(error);
          throw new Meteor.Error("An error occurred saving the order",
            error);
        }
        return result;
      });
  }
});
