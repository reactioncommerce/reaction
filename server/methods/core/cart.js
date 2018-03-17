import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Random } from "meteor/random";
import * as Collections from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";
import { PaymentMethodArgument } from "/lib/collections/schemas";

/**
 * @method quantityProcessing
 * @private
 * @summary Perform calculations admissibility of adding product to cart
 * @param {Object} product - product to add to Cart
 * @param {Object} variant - product variant
 * @param {Number} itemQty - qty to add to cart, defaults to 1, deducts
 *  from inventory
 * @since 1.10.1
 * @return {Number} quantity - revised quantity to be added to cart
 */
function quantityProcessing(product, variant, itemQty = 1) {
  let quantity = itemQty;
  const MIN = variant.minOrderQuantity || 1;
  const MAX = variant.inventoryQuantity || Infinity;

  if (variant.inventoryPolicy && MIN > MAX) {
    Logger.debug(`productId: ${product._id}, variantId ${variant._id
    }: inventoryQuantity lower then minimum order`);
    throw new Meteor.Error("invalid-parameter", `productId: ${product._id}, variantId ${variant._id
    }: inventoryQuantity lower then minimum order`);
  }

  // TODO: think about #152 implementation here
  switch (product.type) {
    case "not-in-stock":
      break;
    default: // type: `simple` // todo: maybe it should be "variant"
      if (quantity < MIN) {
        quantity = MIN;
      } else if (variant.inventoryPolicy && quantity > MAX) {
        quantity = MAX;
      }
  }

  return quantity;
}

/**
 * @method getSessionCarts
 * @private
 * @summary Get Cart cursor with all session carts
 * @param {String} userId - current user _id
 * @param {String} sessionId - current user session id
 * @param {String} shopId - shop id
 * @since 0.10.2
 * @return {Mongo.Cursor} with array of session carts
 */
function getSessionCarts(userId, sessionId, shopId) {
  const carts = Collections.Cart.find({
    $and: [{
      userId: {
        $ne: userId
      }
    }, {
      sessionId: {
        $eq: sessionId
      }
    }, {
      shopId: {
        $eq: shopId
      }
    }]
  });

  // we can't use Array.map here, because we need to reduce the number of array
  // elements if element belongs to registered user, we should throw it.
  const allowedCarts = [];

  // only anonymous user carts allowed
  carts.forEach((cart) => {
    if (Roles.userIsInRole(cart.userId, "anonymous", shopId)) {
      allowedCarts.push(cart);
    }
  });

  return allowedCarts;
}

/**
 * @method removeShippingAddresses
 * @private
 * @summary Remove shipping address from cart
 * @param {String} cart - current cart
 * @return null
 */
function removeShippingAddresses(cart) {
  const cartShipping = cart.shipping;
  cartShipping.map((sRecord) => delete sRecord.address);
  Collections.Cart.update({
    _id: cart._id
  }, {
    $set: { shipping: cartShipping }
  });

  // Calculate discounts
  Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

  // Calculate taxes
  Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);
}

/**
 * @file Methods for Cart - Use these methods by running `Meteor.call()`
 * @example Meteor.call("cart/createCart", this.userId, sessionId)
 * @namespace Methods/Cart
 */

Meteor.methods({
  /**
   * @method cart/mergeCart
   * @summary Merge matching sessionId cart into specified userId cart
   * There should be one cart for each independent, non-logged-in user session.
   * When a user logs in that cart now belongs to that user and we use the a single user cart.
   * If they are logged in on more than one devices, regardless of session,the user cart will be used
   * If they had more than one cart, on more than one device,logged in at separate times then merge the carts
   * @memberof Methods/Cart
   * @param {String} cartId - cartId of the cart to merge matching session carts into.
   * @param {String} [currentSessionId] - current client session id
   * @todo I think this method should be moved out from methods to a Function Declaration to keep it more secure
   * @return {Object|Boolean} cartId - cartId on success or false
   */
  "cart/mergeCart"(cartId, currentSessionId) {
    check(cartId, String);
    // TODO: Review this. currentSessionId sometimes come in as false. e.g from Accounts.onLogin
    check(currentSessionId, Match.Optional(String));

    // we don't process current cart, but merge into it.
    const currentCart = Collections.Cart.findOne(cartId);
    if (!currentCart) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    // just used to filter out the current cart
    // we do additional check of cart exists here and if it not exist, next
    // check supposed to throw 403 error
    const userId = currentCart && currentCart.userId;
    // user should have an access to operate with only one - his - cart
    if (this.userId !== null && userId !== this.userId) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    // persistent sessions, see: publications/sessions.js
    // this is the last place where we still need `Reaction.sessionId`.
    // The use case is: on user log in. I don't know how pass `sessionId` down
    // at that moment.
    const sessionId = currentSessionId || Reaction.sessionId;
    const shopId = Reaction.getShopId();

    // no need to merge anonymous carts
    if (Roles.userIsInRole(userId, "anonymous", shopId)) {
      return false;
    }
    Logger.debug("merge cart: matching sessionId");
    Logger.debug("current userId:", userId);
    Logger.debug("sessionId:", sessionId);
    // get session carts without current user cart cursor
    const sessionCarts = getSessionCarts(userId, sessionId, shopId);

    Logger.debug(`merge cart: begin merge processing of session ${
      sessionId} into: ${currentCart._id}`);
    // loop through session carts and merge into user cart
    sessionCarts.forEach((sessionCart) => {
      Logger.debug(`merge cart: merge user userId: ${userId}, sessionCart.userId: ${
        sessionCart.userId}, sessionCart id: ${sessionCart._id}`);
      // really if we have no items, there's nothing to merge
      if (sessionCart.items) {
        // if currentCart already have a cartWorkflow, we don't need to clean it
        // up completely, just to `coreCheckoutShipping` stage. Also, we will
        // need to recalculate shipping rates
        if (typeof currentCart.workflow === "object" &&
        typeof currentCart.workflow.workflow === "object") {
          if (currentCart.workflow.workflow.length > 2) {
            Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
            // refresh shipping quotes
            Meteor.call("shipping/updateShipmentQuotes", cartId);
          }
        } else {
          // if user logged in he doesn't need to show `checkoutLogin` step
          Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook");
        }

        const cartSum = sessionCart.items.concat(currentCart.items);
        const mergedItems = cartSum.reduce((newItems, item) => {
          if (item) {
            const existingItem = newItems.find((cartItem) => cartItem.variants._id === item.variants._id);
            if (existingItem) {
              existingItem.quantity += item.quantity;
            } else {
              newItems.push(item);
            }
          }
          return newItems;
        }, []);
        Collections.Cart.update(currentCart._id, {
          $push: {
            items: { $each: mergedItems, $slice: -(mergedItems.length) }
          }
        });

        // Calculate discounts
        Hooks.Events.run("afterCartUpdateCalculateDiscount", currentCart._id);
      }

      // cleanup session Carts after merge.
      if (sessionCart.userId !== this.userId) {
        // clear the cart that was used for a session
        // and we're also going to do some garbage Collection
        Collections.Cart.remove(sessionCart._id);
        // cleanup user/accounts
        Collections.Accounts.remove({
          userId: sessionCart.userId
        });
        Hooks.Events.run("afterAccountsRemove", this.userId, sessionCart.userId);
        Meteor.users.remove(sessionCart.userId);
        Logger.debug(`merge cart: delete cart ${
          sessionCart._id} and user: ${sessionCart.userId}`);
      }
      Logger.debug(`merge cart: processed merge for cartId ${sessionCart._id}`);
    });

    // `checkoutLogin` should be used for anonymous only. Registered users
    // no need see this.
    if (currentCart.workflow && currentCart.workflow.status === "new") {
      // to call `workflow/pushCartWorkflow` two times is the only way to move
      // from status "new" to "checkoutAddressBook" which I found without
      // refactoring of `workflow/pushCartWorkflow`
      // We send `cartId` as arguments because this method could be called from
      // publication method and in half cases it could be so, that
      // Meteor.userId() will be null.
      Meteor.call(
        "workflow/pushCartWorkflow", "coreCartWorkflow",
        "checkoutLogin", cartId
      );
      Meteor.call(
        "workflow/pushCartWorkflow", "coreCartWorkflow",
        "checkoutAddressBook", cartId
      );
    }

    return currentCart._id;
  },

  /**
   * @method cart/createCart
   * @summary create new cart for user,
   * but all checks for current cart's existence should go before this method will be called, to keep it clean
   * @memberof Methods/Cart
   * @param {String} userId - userId to create cart for
   * @param {String} sessionId - current client session id
   * @todo I think this method should be moved out from methods to a Function Declaration to keep it more secure
   * @returns {String} cartId - users cartId
   */
  "cart/createCart"(userId, sessionId) {
    check(userId, String);
    check(sessionId, String);

    const marketplaceSettings = Reaction.getMarketplaceSettings();
    let shopId;
    if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantCart) {
      shopId = Reaction.getShopId();
    } else {
      shopId = Reaction.getPrimaryShopId();
    }

    // check if user has `anonymous` role.( this is a visitor)
    const anonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);
    const sessionCartCount = getSessionCarts(userId, sessionId, shopId).length;

    Logger.debug("create cart: shopId", shopId);
    Logger.debug("create cart: userId", userId);
    Logger.debug("create cart: sessionId", sessionId);
    Logger.debug("create cart: sessionCarts.count", sessionCartCount);
    Logger.debug("create cart: anonymousUser", anonymousUser);

    // we need to create a user cart for the new authenticated user or
    // anonymous.
    const currentCartId = Collections.Cart.insert({
      sessionId,
      userId
    });
    Logger.debug(`create cart: into new user cart. created: ${currentCartId} for user ${userId}`);

    // merge session carts into the current cart
    if (sessionCartCount > 0 && !anonymousUser) {
      Logger.debug(`create cart: found existing cart. merge into ${currentCartId} for user ${userId}`);
      Meteor.call("cart/mergeCart", currentCartId, sessionId);
    }

    // we should check for an default billing/shipping address in user account.
    // this needed after submitting order, when user receives new cart
    const account = Collections.Accounts.findOne(userId);
    if (account && account.profile && account.profile.addressBook) {
      account.profile.addressBook.forEach((address) => {
        if (address.isBillingDefault) {
          Meteor.call("cart/setPaymentAddress", currentCartId, address);
        }
        if (address.isShippingDefault) {
          Meteor.call("cart/setShipmentAddress", currentCartId, address);
        }
      });
    }

    // attach current user currency to cart
    const currentUser = Meteor.user();
    let userCurrency = Reaction.getShopCurrency();

    // Check to see if the user has a custom currency saved to their profile
    // Use it if they do
    if (currentUser && currentUser.profile && currentUser.profile.currency) {
      userCurrency = currentUser.profile.currency;
    }
    Meteor.call("cart/setUserCurrency", currentCartId, userCurrency);

    return currentCartId;
  },

  /**
   *  @method cart/addToCart
   *  @summary Add items to a user cart. When we add an item to the cart,
   *  we want to break all relationships with the existing item.
   *  We want to fix price, qty, etc into history.
   *  However, we could check reactively for price /qty etc, adjustments on the original and notify them.
   *  @memberof Methods/Cart
   *  @param {String} productId - productId to add to Cart
   *  @param {String} variantId - product variant _id
   *  @param {Number} [itemQty] - qty to add to cart
   *  @param {Object} [additionalOptions] - object containing additional options and fields for cart item
   *  @return {Number|Object} Mongo insert response
   */
  "cart/addToCart"(productId, variantId, itemQty, additionalOptions) {
    check(productId, String);
    check(variantId, String);
    check(itemQty, Match.Optional(Number));
    check(additionalOptions, Match.Optional(Object));

    // Copy additionalOptions into an options object to use througout the method
    const options = {
      overwriteExistingMetafields: false, // Allows updating of metafields on quantity change
      metafields: undefined, // Array of MetaFields to set on the CartItem
      ...additionalOptions || {}
    };

    const cart = Collections.Cart.findOne({ userId: this.userId });
    if (!cart) {
      Logger.error(`Cart not found for user: ${this.userId}`);
      throw new Meteor.Error(
        "invalid-parameter",
        "Cart not found for user with such id"
      );
    }
    // With the flattened model we no longer need to work directly with the
    // products. But product still could be necessary for a `quantityProcessing`
    // TODO: need to understand: do we really need product inside
    // `quantityProcessing`?
    let product;
    let variant;
    Collections.Products.find({
      _id: {
        $in: [
          productId,
          variantId
        ]
      }
    }).forEach((doc) => {
      if (doc.type === "simple") {
        product = doc;
      } else {
        variant = doc;
      }
    });

    // TODO: this lines still needed. We could uncomment them in future if
    // decide to not completely remove product data from this method
    // const product = Collections.Products.findOne(productId);
    // const variant = Collections.Products.findOne(variantId);
    if (!product) {
      Logger.warn(`Product: ${productId} was not found in database`);
      throw new Meteor.Error(
        "not-found",
        "Product with such id was not found"
      );
    }
    if (!variant) {
      Logger.warn(`Product variant: ${variantId} was not found in database`);
      throw new Meteor.Error(
        "not-found",
        "ProductVariant with such id was not found"
      );
    }
    // performs calculations admissibility of adding product to cart
    const quantity = quantityProcessing(product, variant, itemQty);
    // performs search of variant inside cart
    const cartVariantExists = cart.items && cart.items
      .some((item) => item.variants._id === variantId);

    if (cartVariantExists) {
      let modifier = {};

      // Allows for updating metafields on an existing item when the quantity also changes
      if (options.overwriteExistingMetafields) {
        modifier = {
          $set: {
            "items.$.metafields": options.metafields
          }
        };
      }

      let updateResult;

      try {
        updateResult = Collections.Cart.update({
          "_id": cart._id,
          "items.product._id": productId,
          "items.variants._id": variantId
        }, {
          $inc: {
            "items.$.quantity": quantity
          },
          ...modifier
        });
      } catch (error) {
        Logger.error("Error adding to cart.", error);
        Logger.error(
          "Error adding to cart. Invalid keys:",
          Collections.Cart.simpleSchema().namedContext().validationErrors()
        );
        throw error;
      }

      // Update inventory
      Hooks.Events.run("afterModifyQuantityInCart", cart._id, { productId, variantId });
      // Calculate discounts
      Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);
      // refresh shipping quotes
      Meteor.call("shipping/updateShipmentQuotes", cart._id);
      // revert workflow to checkout shipping step.
      Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
      // reset selected shipment method
      Meteor.call("cart/resetShipmentMethod", cart._id);
      // Calculate taxes
      Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);

      Logger.debug(`cart: increment variant ${variantId} quantity by ${quantity}`);

      return updateResult;
    }

    // TODO: Handle more than 2 levels of variant hierarchy for determining parcel dimensions
    // we need to get the parent of the option to check if parcel info is stored there
    const immediateAncestors = variant.ancestors.filter((ancestor) => ancestor !== product._id);
    const immediateAncestor = Collections.Products.findOne({ _id: immediateAncestors[0] });
    let parcel = null;
    if (immediateAncestor) {
      if (immediateAncestor.weight || immediateAncestor.height || immediateAncestor.width || immediateAncestor.length) {
        parcel = { weight: immediateAncestor.weight, height: immediateAncestor.height, width: immediateAncestor.width, length: immediateAncestor.length };
      }
    }
    // if it's set at the option level then that overrides
    if (variant.weight || variant.height || variant.width || variant.length) {
      parcel = { weight: variant.weight, height: variant.height, width: variant.width, length: variant.length };
    }
    // cart variant doesn't exist
    let updateResult;
    const newItemId = Random.id();

    try {
      updateResult = Collections.Cart.update({
        _id: cart._id
      }, {
        $addToSet: {
          items: {
            _id: newItemId,
            shopId: product.shopId,
            productId,
            quantity,
            product,
            variants: variant,
            metafields: options.metafields,
            title: product.title,
            type: product.type,
            parcel
          }
        }
      });
    } catch (error) {
      Logger.error("Error adding to cart.", error);
      Logger.error(
        "Error adding to cart. Invalid keys:",
        Collections.Cart.simpleSchema().namedContext().validationErrors()
      );
      throw error;
    }

    // Update add inventory reserve
    Hooks.Events.run("afterAddItemsToCart", cart._id, { newItemId });
    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);
    // refresh shipping quotes
    Meteor.call("shipping/updateShipmentQuotes", cart._id);
    // revert workflow to checkout shipping step.
    Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
    // reset selected shipment method
    Meteor.call("cart/resetShipmentMethod", cart._id);
    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);

    Logger.debug(`cart: add variant ${variantId} to cartId ${cart._id}`);

    return updateResult;
  },

  /**
   * @method cart/removeFromCart
   * @memberof Methods/Cart
   * @summary Removes or adjust quantity of a variant from the cart
   * @param {String} itemId - cart item _id
   * @param {Number} [quantity] - if provided will adjust increment by quantity
   * @returns {Number} returns Mongo update result
   */
  "cart/removeFromCart"(itemId, quantity) {
    check(itemId, String);
    check(quantity, Match.Optional(Number));

    const userId = Meteor.userId();
    const cart = Collections.Cart.findOne({ userId });
    if (!cart) {
      Logger.error(`Cart not found for user: ${this.userId}`);
      throw new Meteor.Error("not-found", "Cart not found for user with such id");
    }

    let cartItem;

    if (cart.items) {
      cartItem = _.find(cart.items, (item) => item._id === itemId);
    }

    // extra check of item exists
    if (typeof cartItem !== "object") {
      Logger.error(`Unable to find an item: ${itemId} within the cart: ${cart._id}`);
      throw new Meteor.Error("not-found", "Unable to find an item with such id in cart.");
    }

    if (!quantity || quantity >= cartItem.quantity) {
      let cartResult;
      try {
        cartResult = Collections.Cart.update({
          _id: cart._id
        }, {
          $pull: {
            items: {
              _id: itemId
            }
          }
        }, {
          getAutoValues: false // See https://github.com/aldeed/meteor-collection2/issues/245
        });
      } catch (error) {
        Logger.error("Error removing from cart.", error);
        Logger.error(
          "Error removing from cart. Invalid keys:",
          Collections.Cart.simpleSchema().namedContext().validationErrors()
        );
        throw error;
      }

      Logger.debug(`cart: deleted cart item variant id ${cartItem.variants._id}`);

      // Clear inventory reservation
      Meteor.call("inventory/clearReserve", [cartItem]);
      // Calculate discounts
      Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);
      // TODO: HACK: When calling update shipping the changes to the cart have not taken place yet
      // TODO: But calling this findOne seems to force this record to update. Extra weird since we aren't
      // TODO: passing the Cart but just the cartId and regrabbing it so you would think that would work but it does not
      Collections.Cart.findOne(cart._id);
      // refresh shipping quotes
      Meteor.call("shipping/updateShipmentQuotes", cart._id);
      // revert workflow
      Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
      // reset selected shipment method
      Meteor.call("cart/resetShipmentMethod", cart._id);
      // Calculate taxes
      Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);
      return cartResult;
    }

    // if quantity lets convert to negative and increment
    const removeQuantity = Math.abs(quantity) * -1;

    let cartResult;
    try {
      cartResult = Collections.Cart.update({
        "_id": cart._id,
        "items._id": cartItem._id
      }, {
        $inc: {
          "items.$.quantity": removeQuantity
        }
      });
    } catch (error) {
      Logger.error("Error removing from cart.", error);
      Logger.error(
        "Error removing from cart. Invalid keys:",
        Collections.Cart.simpleSchema().namedContext().validationErrors()
      );
      throw error;
    }

    // Clear inventory status for multiple instances of this item
    // If quantity is provided, then set cartItem to it, so that quantity
    // provided will be cleared in the inventory.
    cartItem.quantity = quantity;
    Meteor.call("inventory/clearReserve", [cartItem]);
    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);
    Logger.debug(`cart: removed variant ${cartItem._id} quantity of ${quantity}`);
    // refresh shipping quotes
    Meteor.call("shipping/updateShipmentQuotes", cart._id);
    // revert workflow
    Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
    // reset selected shipment method
    Meteor.call("cart/resetShipmentMethod", cart._id);
    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cart._id);

    return cartResult;
  },

  /**
   * @method cart/setShipmentMethod
   * @memberof Methods/Cart
   * @summary Saves method as order default
   * @param {String} cartId - cartId to apply shipmentMethod
   * @param {Object} method - shipmentMethod object
   * @return {Number} return Mongo update result
   */
  "cart/setShipmentMethod"(cartId, method) {
    check(cartId, String);
    Reaction.Schemas.ShippingMethod.validate(method);

    // get current cart
    const cart = Collections.Cart.findOne({
      _id: cartId,
      userId: Meteor.userId()
    });
    if (!cart) {
      Logger.error(`Cart not found for user: ${this.userId}`);
      throw new Meteor.Error(
        "not-found",
        "Cart not found for user with such id"
      );
    }

    // Sets all shipping methods to the one selected
    // TODO: Accept an object of shopId to method map to ship via different methods per shop
    let update;
    // if we have an existing item update it, otherwise add to set.
    if (cart.shipping) {
      const shipping = cart.shipping.map((shipRecord) => ({
        ...shipRecord,
        shipmentMethod: method
      }));
      update = { $set: { shipping } };
    } else {
      update = {
        $addToSet: {
          shipping: {
            shipmentMethod: method,
            shopId: cart.shopId
          }
        }
      };
    }

    // update or insert method
    try {
      Collections.Cart.update({ _id: cartId }, update);
    } catch (e) {
      Logger.error(e, `Error adding rates to cart ${cartId}`);
      throw new Meteor.Error("server-error", "An error occurred saving the order", e);
    }


    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

    // this will transition to review
    return Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "coreCheckoutShipping");
  },

  /**
   * @method cart/setUserCurrency
   * @memberof Methods/Cart
   * @summary Saves user currency in cart, to be paired with order/setCurrencyExhange
   * @param {String} cartId - cartId to apply setUserCurrency
   * @param {String} userCurrency - userCurrency to set to cart
   * @return {Number} update result
   */
  "cart/setUserCurrency"(cartId, userCurrency) {
    check(cartId, String);
    check(userCurrency, String);
    const cart = Collections.Cart.findOne({ _id: cartId });
    if (!cart) {
      Logger.error(`Cart not found for user: ${this.userId}`);
      throw new Meteor.Error("not-found", "Cart not found for user with such id");
    }

    const userCurrencyString = {
      userCurrency
    };

    let selector;
    let update;

    if (cart.billing) {
      selector = {
        "_id": cartId,
        "billing._id": cart.billing[0]._id
      };
      update = {
        $set: {
          "billing.$.currency": userCurrencyString
        }
      };
    } else {
      selector = {
        _id: cartId
      };
      update = {
        $addToSet: {
          billing: {
            currency: userCurrencyString
          }
        }
      };
    }

    // add / or set the shipping address
    try {
      Collections.Cart.update(selector, update);
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error("server-error", "An error occurred adding the currency");
    }

    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

    return true;
  },

  /**
   * @method cart/resetShipmentMethod
   * @memberof Methods/Cart
   * @summary Removes `shipmentMethod` object from cart
   * @param {String} cartId - cart _id
   * @return {Number} update result
   */
  "cart/resetShipmentMethod"(cartId) {
    check(cartId, String);

    const cart = Collections.Cart.findOne({
      _id: cartId,
      userId: this.userId
    });
    if (!cart) {
      Logger.error(`Cart not found for user: ${this.userId}`);
      throw new Meteor.Error(
        "not-found",
        `Cart: ${cartId} not found for user: ${this.userId}`
      );
    }

    return Collections.Cart.update({ _id: cartId }, {
      $unset: { "shipping.0.shipmentMethod": "" }
    });
  },

  /**
   * @method cart/setShipmentAddress
   * @memberof Methods/Cart
   * @summary Adds address book to cart shipping
   * @param {String} cartId - cartId to apply shipmentMethod
   * @param {Object} address - addressBook object
   * @return {Number} update result
   */
  "cart/setShipmentAddress"(cartId, address) {
    check(cartId, String);
    Reaction.Schemas.Address.validate(address);

    const cart = Collections.Cart.findOne({
      _id: cartId,
      userId: this.userId
    });
    if (!cart) {
      Logger.error(`Cart not found for user: ${this.userId}`);
      throw new Meteor.Error(
        "not-found",
        "Cart not found for user with such id"
      );
    }
    // TODO: When we have a front end for doing more than one address
    // TODO: we need to not use the same address for every record
    // TODO: this is a temporary workaround so that we have a valid address
    // TODO: for every shipping record
    let selector;
    let update;
    let updated = false; // if we update inline set to true, otherwise fault to update at the end
    // We have two behaviors depending on if we have existing shipping records and if we
    // have items in the cart.
    if (cart.shipping && cart.shipping.length > 0 && cart.items) {
      // if we have shipping records and cart.items, update each one by shop
      const shopIds = Object.keys(cart.getItemsByShop());
      shopIds.forEach((shopId) => {
        selector = {
          "_id": cartId,
          "shipping.shopId": shopId
        };

        update = {
          $set: {
            "shipping.$.address": address
          }
        };
        try {
          Collections.Cart.update(selector, update);
          updated = true;
        } catch (error) {
          Logger.error("An error occurred adding the address", error);
          throw new Meteor.Error("An error occurred adding the address", error);
        }
      });
    } else if (!cart.items) { // if no items in cart just add or modify one record for the carts shop
      // add a shipping record if it doesn't exist
      if (!cart.shipping) {
        selector = {
          _id: cartId
        };
        update = {
          $push: {
            shipping: {
              address,
              shopId: cart.shopId
            }
          }
        };

        try {
          Collections.Cart.update(selector, update);
          updated = true;
        } catch (error) {
          Logger.error(error);
          throw new Meteor.Error("server-error", "An error occurred adding the address");
        }
      } else {
        // modify an existing record if we have one already
        selector = {
          "_id": cartId,
          "shipping.shopId": cart.shopId
        };

        update = {
          $set: {
            "shipping.$.address": address
          }
        };
      }
    } else {
      // if we have items in the cart but we didn't have existing shipping records
      // add a record for each shop that's represented in the items
      const shopIds = Object.keys(cart.getItemsByShop());
      shopIds.forEach((shopId) => {
        selector = {
          _id: cartId
        };
        update = {
          $addToSet: {
            shipping: {
              address,
              shopId
            }
          }
        };
      });
    }
    if (!updated) {
      // if we didn't do one of the inline updates, then run the update here
      try {
        Collections.Cart.update(selector, update);
      } catch (error) {
        Logger.error(error);
        throw new Meteor.Error("server-error", "An error occurred adding the address");
      }
    }
    // refresh shipping quotes
    Meteor.call("shipping/updateShipmentQuotes", cartId);

    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);

    if (typeof cart.workflow !== "object") {
      throw new Meteor.Error(
        "server-error",
        "Cart workflow object not detected."
      );
    }

    // ~~it's ok for this to be called multiple times~~
    // call it only once when we at the `checkoutAddressBook` step
    if (typeof cart.workflow.workflow === "object" &&
      cart.workflow.workflow.length < 2) {
      Meteor.call(
        "workflow/pushCartWorkflow", "coreCartWorkflow",
        "coreCheckoutShipping"
      );
    }

    // if we change default address during further steps, we need to revert
    // workflow back to `coreCheckoutShipping` step
    if (typeof cart.workflow.workflow === "object" &&
      cart.workflow.workflow.length > 2) { // "2" index of
      // `coreCheckoutShipping`
      Meteor.call("workflow/revertCartWorkflow", "coreCheckoutShipping");
    }

    return true;
  },

  /**
   * @method cart/setPaymentAddress
   * @memberof Methods/Cart
   * @summary Adds addressbook to cart payments
   * @param {String} cartId - cartId to apply payment address
   * @param {Object} address - addressBook object
   * @todo maybe we need to rename this method to `cart/setBillingAddress`?
   * @return {Number} return Mongo update result
   */
  "cart/setPaymentAddress"(cartId, address) {
    check(cartId, String);
    Reaction.Schemas.Address.validate(address);

    const cart = Collections.Cart.findOne({
      _id: cartId,
      userId: this.userId
    });

    if (!cart) {
      Logger.error(`Cart not found for user: ${this.userId}`);
      throw new Meteor.Error(
        "not-found",
        "Cart not found for user with such id"
      );
    }

    let selector;
    let update;
    // temp hack until we build out multiple billing handlers
    // if we have an existing item update it, otherwise add to set.
    if (Array.isArray(cart.billing) && cart.billing.length > 0) {
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
            address
          }
        }
      };
    }

    const result = Collections.Cart.update(selector, update);

    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);

    return result;
  },

  /**
   * @method cart/unsetAddresses
   * @summary Removes address from cart.
   * @memberof Methods/Cart
   * @param {String} addressId - address._id
   * @param {String} userId - cart owner _id
   * @param {String} [type] - billing default or shipping default
   * @since 0.10.1
   * @todo Check if no more address in cart as shipping, we should reset `cartWorkflow` to second step
   * @return {Number|Object|Boolean} The number of removed documents or
   * error object or `false` if we don't need to update cart
   */
  "cart/unsetAddresses"(addressId, userId, type) {
    check(addressId, String);
    check(userId, String);
    check(type, Match.Optional(String));

    // do we actually need to change anything?
    let needToUpdate = false;
    // we need to revert the workflow after a "shipping" address was removed
    let isShippingDeleting = false;
    const cart = Collections.Cart.findOne({
      userId
    });
    const selector = {
      _id: cart._id
    };
    const update = { $unset: {} };
    // user could turn off the checkbox in address to not to be default, then we
    // receive `type` arg
    if (typeof type === "string") {
      // we assume that the billing/shipping arrays can hold only one element [0]
      if (cart[type] && typeof cart[type][0].address === "object" &&
        cart[type][0].address._id === addressId) {
        update.$unset[`${type}.0.address`] = "";
        needToUpdate = true;
        isShippingDeleting = type === "shipping";
      }
    } else { // or if we remove address itself, when we run this part we assume
      // that the billing/shipping arrays can hold only one element [0]
      if (cart.billing && typeof cart.billing[0].address === "object" &&
        cart.billing[0].address._id === addressId) {
        update.$unset["billing.0.address"] = "";
        needToUpdate = true;
      }
      if (cart.shipping && typeof cart.shipping[0].address === "object" && cart.shipping[0].address._id === addressId) {
        removeShippingAddresses(cart);
        isShippingDeleting = true;
      }
    }

    if (needToUpdate) {
      try {
        Collections.Cart.update(selector, update);
      } catch (e) {
        Logger.error(e);
        throw new Meteor.Error("server-error", "Error updating cart");
      }

      // Calculate discounts
      Hooks.Events.run("afterCartUpdateCalculateDiscount", cart._id);

      if (isShippingDeleting) {
        // if we remove shipping address from cart, we need to revert
        // `cartWorkflow` to the `checkoutAddressBook` step.
        Meteor.call("workflow/revertCartWorkflow", "checkoutAddressBook");
      }
    }
    return true;
  },

  /**
   * @method cart/submitPayment
   * @memberof Methods/Cart
   * @summary Saves a submitted payment to cart, triggers workflow and adds "paymentSubmitted" to cart workflow
   * Note: this method also has a client stub, that forwards to cartCompleted
   * @param {Object|Array} paymentMethods - an array of paymentMethods or (deprecated) a single paymentMethod object
   * @return {String} returns update result
   */
  "cart/submitPayment"(paymentMethods) {
    PaymentMethodArgument.validate(paymentMethods);

    const cart = Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    const cartId = cart._id;

    const cartShipping = cart.getShippingTotal();
    const cartShippingByShop = cart.getShippingTotalByShop();
    const cartSubTotal = cart.getSubTotal();
    const cartSubtotalByShop = cart.getSubtotalByShop();
    const cartTaxes = cart.getTaxTotal();
    const cartTaxesByShop = cart.getTaxesByShop();
    const cartDiscounts = cart.getDiscounts();
    const cartTotal = cart.getTotal();
    const cartTotalByShop = cart.getTotalByShop();

    // we won't actually close the order at this stage.
    // we'll just update the workflow and billing data where
    // method-hooks can process the workflow update.

    // Find the payment address associated that the user input during the
    // checkout process
    let paymentAddress;
    if (Array.isArray(cart.billing) && cart.billing[0]) {
      paymentAddress = cart.billing[0].address;
    }

    const payments = [];

    // Payment plugins which have been updated for marketplace are passing an array as paymentMethods
    if (Array.isArray(paymentMethods)) {
      paymentMethods.forEach((paymentMethod) => {
        const { shopId } = paymentMethod;
        const invoice = {
          shipping: parseFloat(cartShippingByShop[shopId]),
          subtotal: parseFloat(cartSubtotalByShop[shopId]),
          taxes: parseFloat(cartTaxesByShop[shopId]),
          discounts: parseFloat(cartDiscounts),
          total: parseFloat(cartTotalByShop[shopId])
        };

        payments.push({
          paymentMethod,
          invoice,
          address: paymentAddress,
          shopId
        });
      });
    } else {
      // Legacy payment integration - transactions are not split by shop
      // Create an invoice based on cart totals.
      const invoice = {
        shipping: cartShipping,
        subtotal: cartSubTotal,
        taxes: cartTaxes,
        discounts: cartDiscounts,
        total: cartTotal
      };

      // Legacy payment plugins are passing in a single paymentMethod object
      payments.push({
        paymentMethod: paymentMethods,
        invoice,
        address: paymentAddress,
        shopId: Reaction.getPrimaryShopId()
      });
    }

    // e.g. discount records would be already present on the billing array. Add to the end of the array.
    const discountRecords = cart.billing.filter((billingInfo) => billingInfo.paymentMethod);
    payments.push(...discountRecords);

    const selector = {
      _id: cartId
    };

    const update = {
      $set: {
        billing: payments
      }
    };

    try {
      Collections.Cart.update(selector, update);
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error("server-error", "An error occurred saving the order");
    }

    // Calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", cartId);

    // Calculate taxes
    Hooks.Events.run("afterCartUpdateCalculateTaxes", cartId);

    return Collections.Cart.findOne(selector);
  },

  /**
   * @method cart/setAnonymousUserEmail
   * @memberof Methods/Cart
   * @summary Assigns email to anonymous user's cart instance
   * @param {Object} userId - current user's Id
   * @param {String} email - email to set for anonymous user's cart instance
   * @return {Number} returns update result
   */
  "cart/setAnonymousUserEmail"(userId, email) {
    check(userId, String);
    check(email, String);

    const currentUserCart = Collections.Cart.findOne({ userId });
    const cartId = currentUserCart._id;
    let newEmail = "";

    if (!currentUserCart.email) {
      newEmail = email;
    }

    return Collections.Cart.update({ _id: cartId }, { $set: { email: newEmail } });
  }
});
